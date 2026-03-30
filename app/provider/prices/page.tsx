'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ProcedurePrice {
  id: string;
  procedure_id: string;
  procedure_name: string;
  price_usd: number | null;
  price_notes: string | null;
}

export default function PricesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [procedures, setProcedures] = useState<ProcedurePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prices, setPrices] = useState<Record<string, { price: string; notes: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login?redirectTo=/provider/prices');
        return;
      }

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userData || userData.role !== 'provider' || !userData.provider_id) {
        router.push('/');
        return;
      }

      setUser(userData);

      // Get provider data
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('id', userData.provider_id)
        .single();

      setProvider(providerData);

      // Get category for provider to fetch procedures
      if (providerData?.category_id) {
        const { data: procData } = await supabase
          .from('procedures')
          .select('*')
          .eq('category_id', providerData.category_id)
          .order('sort_order');

        // Get current prices
        const { data: priceData } = await supabase
          .from('provider_prices')
          .select('*')
          .eq('provider_id', userData.provider_id);

        const priceMap = new Map(priceData?.map((p) => [p.procedure_id, p]) || []);
        const proceduresWithPrices = (procData || []).map((proc) => {
          const price = priceMap.get(proc.id);
          return {
            id: price?.id || `new_${proc.id}`,
            procedure_id: proc.id,
            procedure_name: proc.name,
            price_usd: price?.price_usd,
            price_notes: price?.price_notes,
          };
        });

        setProcedures(proceduresWithPrices);

        // Initialize prices state
        const initialPrices: Record<string, { price: string; notes: string }> = {};
        proceduresWithPrices.forEach((proc) => {
          initialPrices[proc.procedure_id] = {
            price: proc.price_usd?.toString() || '',
            notes: proc.price_notes || '',
          };
        });
        setPrices(initialPrices);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrice = async (procedureId: string) => {
    try {
      setSavingId(procedureId);
      setError('');

      const priceValue = prices[procedureId];
      if (!priceValue) return;

      const price = priceValue.price ? parseFloat(priceValue.price) : null;
      const existingProc = procedures.find((p) => p.procedure_id === procedureId);

      if (existingProc?.id.startsWith('new_')) {
        // Insert new price
        if (price !== null) {
          const { error: insertError } = await supabase.from('provider_prices').insert({
            provider_id: provider.id,
            procedure_id: procedureId,
            price_usd: price,
            price_notes: priceValue.notes || null,
          });

          if (insertError) throw insertError;
        }
      } else {
        // Update existing price
        const { error: updateError } = await supabase
          .from('provider_prices')
          .update({
            price_usd: price,
            price_notes: priceValue.notes || null,
          })
          .eq('id', existingProc?.id);

        if (updateError) throw updateError;
      }

      setSuccess(`Price saved for ${procedures.find((p) => p.procedure_id === procedureId)?.procedure_name}`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save price');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Manage Pricing</h1>
          <p className="text-neutral-600">Set prices for procedures in your category</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Important Note</p>
            <p className="text-amber-800 text-sm mt-0.5">
              Prices you set here are binding. Once a patient accepts a quote at these prices, the
              price cannot be changed.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-error-light text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-3 bg-brand-green-light text-brand-green rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Prices Table */}
        <Card>
          <CardHeader className="border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">
              Procedures & Pricing for {provider?.name}
            </h2>
          </CardHeader>

          <CardContent className="pt-6">
            {procedures.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">
                  No procedures available for your category. Contact support to update your category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Procedure
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Price (USD)
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Notes
                        </th>
                        <th className="text-right py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {procedures.map((proc) => (
                        <tr key={proc.procedure_id} className="border-b border-neutral-100">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-neutral-900">{proc.procedure_name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={prices[proc.procedure_id]?.price || ''}
                              onChange={(e) =>
                                setPrices({
                                  ...prices,
                                  [proc.procedure_id]: {
                                    ...prices[proc.procedure_id],
                                    price: e.target.value,
                                  },
                                })
                              }
                              className="max-w-xs"
                              step="0.01"
                              min="0"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <Input
                              type="text"
                              placeholder="e.g., Includes cleaning"
                              value={prices[proc.procedure_id]?.notes || ''}
                              onChange={(e) =>
                                setPrices({
                                  ...prices,
                                  [proc.procedure_id]: {
                                    ...prices[proc.procedure_id],
                                    notes: e.target.value,
                                  },
                                })
                              }
                              className="max-w-xs"
                            />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSavePrice(proc.procedure_id)}
                              loading={savingId === proc.procedure_id}
                              disabled={savingId === proc.procedure_id}
                            >
                              Save
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {procedures.map((proc) => (
                    <Card key={proc.procedure_id} className="bg-neutral-50">
                      <CardContent className="pt-4 pb-4 space-y-4">
                        <div>
                          <p className="font-semibold text-neutral-900 mb-2">{proc.procedure_name}</p>
                        </div>

                        <Input
                          label="Price (USD)"
                          type="number"
                          placeholder="0.00"
                          value={prices[proc.procedure_id]?.price || ''}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              [proc.procedure_id]: {
                                ...prices[proc.procedure_id],
                                price: e.target.value,
                              },
                            })
                          }
                          step="0.01"
                          min="0"
                        />

                        <Input
                          label="Notes"
                          type="text"
                          placeholder="e.g., Includes cleaning"
                          value={prices[proc.procedure_id]?.notes || ''}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              [proc.procedure_id]: {
                                ...prices[proc.procedure_id],
                                notes: e.target.value,
                              },
                            })
                          }
                        />

                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => handleSavePrice(proc.procedure_id)}
                          loading={savingId === proc.procedure_id}
                          disabled={savingId === proc.procedure_id}
                          className="w-full"
                        >
                          Save Price
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
