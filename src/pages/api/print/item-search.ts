/**
 * API route: POST /api/print/item-search
 * Fetches full item details (including styleId) from the ECS item-search API
 * for each selected worklist item. Called before adhoc-preview-load-data to
 * enrich the args with styleId, price, planoId, and other sign metadata.
 *
 * Body: { items: Array<{ storeId: string; productCode: string; productTypeCode: string }> }
 * Returns: { success, items: ItemSearchResult[] }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS, ECS_BATCH_API_PATHS } from "../../../lib/constants";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import { SIGNS_API_BASE_URL } from "../../../services/config";
import { getAccessToken } from "../../../services/oauthTokenService";

export interface ItemSearchResult {
  storeId: string;
  productCode: string;
  productTypeCode: string;
  description: string;
  effectiveDate: string;
  signEndDate: string;
  price: string;
  prclvlId: number;
  planoName: string | null;
  planoId: string | null;
  planoRow: number;
  styleName: string;
  styleId: number;
  countryOfOriginRow: number;
  countryOfOriginDataString: string | null;
  aisle: string | null;
  bay: string | null;
  shelf: string | null;
  shelfSequence: string | null;
}

interface ItemSearchInput {
  storeId: string;
  productCode: string;
  productTypeCode: string;
}

interface EcsItemSearchResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ItemSearchResult[];
}

interface ItemSearchRequestBody {
  items?: ItemSearchInput[];
}

/**
 * Calls the ECS item-search endpoint for a single item and returns the first result.
 * Returns null if the item is not found or the call fails.
 */
async function fetchOneItem(
  token: string,
  input: ItemSearchInput
): Promise<ItemSearchResult | null> {
  const url = `${SIGNS_API_BASE_URL}${ECS_BATCH_API_PATHS.ITEM_SEARCH}`;

  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        storeId: input.storeId,
        productCode: input.productCode,
        productTypeCode: input.productTypeCode,
      }),
    });

    if (!res.ok) {
      // TODO: remove console logging before production
      console.warn(`[item-search] ${input.productCode} → HTTP ${res.status}`);
      return null;
    }

    const json = await res.json() as EcsItemSearchResponse;
    return json.data?.[0] ?? null;
  } catch (err: unknown) {
    // TODO: remove console logging before production
    console.warn(`[item-search] ${input.productCode} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { items } = req.body as ItemSearchRequestBody;

  if (!items?.length) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "items array is required and must not be empty." });
    return;
  }

  try {
    const token = await getAccessToken();

    // Fetch all items in parallel
    const results = await Promise.all(items.map((item) => fetchOneItem(token, item)));

    const found = results.filter((r): r is ItemSearchResult => r !== null);

    // TODO: remove console logging before production
    console.log(`[/api/print/item-search] fetched ${found.length}/${items.length} items`);

    res.status(HTTP_STATUS.OK).json({ success: true, items: found });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch item details.";
    console.error("[/api/print/item-search]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
