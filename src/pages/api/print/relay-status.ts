import type { NextApiRequest, NextApiResponse } from "next";
import { printRelay } from "@/lib/ws-relay-server";

type RelayStatusResponse = {
  relayEnabled: boolean;
  connectedStoreIds: string[];
};

/**
 * Returns current WebSocket relay connectivity state.
 * @param {NextApiRequest} req - API request.
 * @param {NextApiResponse<RelayStatusResponse>} res - API response.
 * @returns {void}
 */
export default function relayStatusHandler(
  req: NextApiRequest,
  res: NextApiResponse<RelayStatusResponse>,
): void {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  res.status(200).json({
    relayEnabled: process.env.WS_RELAY_ENABLED === "true",
    connectedStoreIds: printRelay.getConnectedStoreIds(),
  });
}
