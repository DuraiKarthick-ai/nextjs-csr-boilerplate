"use client";

import React, { useState } from 'react';
import { itemService } from '@/services/item.service';
import { generateId } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function ReceiveChangePage() {
  const [description, setDescription] = useState('Test Item');
  const [price, setPrice] = useState<number | ''>(99.99);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    // Generate unique ItemId per request as requested
    const itemId = generateId('ITEM');

    try {
      const payload = {
        itemId,
        description,
        price: typeof price === 'number' ? price : parseFloat(String(price) || '0'),
      };

      // Debugging: log payload and header expectation so you can inspect network tab and console
      // (This is safe for development; remove before production)
      // eslint-disable-next-line no-console
      console.log('Sending Receive-Change payload:', payload);

      const data = await itemService.receiveChange(payload);
      setResponse({ success: true, data });
      toast.success('Receive-Change successful');
    } catch (err: any) {
      setResponse({ success: false, error: err?.message || String(err) });
      toast.error('Receive-Change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>API: Receive-Change</CardTitle>
          <CardDescription>POST to external API: http://35.188.204.114/api/v1/Item/Receive-Change</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border p-2"
                placeholder="Description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-md border p-2"
                placeholder="Price"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Receive-Change'}
              </Button>
              <Button variant="outline" type="button" onClick={() => { setDescription('Test Item'); setPrice(99.99); setResponse(null); }}>
                Reset
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <h4 className="text-lg font-medium">Response</h4>
            <pre className="mt-2 p-4 bg-slate-900 text-white rounded-md overflow-auto max-h-96">
              {response ? JSON.stringify(response, null, 2) : 'No response yet'}
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <small className="text-muted-foreground">Note: ItemId is generated uniquely per request.</small>
        </CardFooter>
      </Card>
    </div>
  );
}
