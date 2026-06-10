/**
 * useCustomSign hook — manages state and actions for the Custom Sign Builder.
 * Handles product code input, size selection, lookup, per-field re-render on blur,
 * preview image state, print submission, and form reset.
 */

import { useState, useCallback } from "react";
import type {
  CustomSignRenderRequest,
  CustomSignRenderResponseItem,
} from "../../../types/sign.types";
import { renderCustomSign, printCustomSign } from "../services/customSignService";
import { isValidItemNumber } from "../../../lib/validators";
import {
  DEFAULT_PRINT_QUANTITY,
  DEFAULT_SIGN_STYLE_NAME,
  DEFAULT_STORE_ID,
  SIGN_OUTPUT_TYPE,
} from "../../../lib/constants";

export interface UseCustomSignResult {
  productCode: string;
  size: string;
  quantity: number;
  titleLine1: string;
  titleLine2: string;
  previewBase64: string | null;
  isLoaded: boolean;
  isLookingUp: boolean;
  isRerendering: boolean;
  isPrinting: boolean;
  error: string | null;
  setProductCode: (value: string) => void;
  setSize: (value: string) => void;
  setQuantity: (quantity: number) => void;
  setTitleLine1: (value: string) => void;
  setTitleLine2: (value: string) => void;
  handleLookup: () => Promise<void>;
  handleFieldBlur: () => Promise<void>;
  handlePrint: () => Promise<void>;
  handleReset: () => void;
}

function useCustomSign(): UseCustomSignResult {
  const [productCode, setProductCode] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState<number>(DEFAULT_PRINT_QUANTITY);
  const [titleLine1, setTitleLine1] = useState("");
  const [titleLine2, setTitleLine2] = useState("");
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRerendering, setIsRerendering] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildRenderPayload(): CustomSignRenderRequest[] {
    return [
      {
        styleName: DEFAULT_SIGN_STYLE_NAME,
        outputType: SIGN_OUTPUT_TYPE,
        productCode: productCode.trim(),
        storeId: DEFAULT_STORE_ID,
        outputParams: "",
        shapeNameValues: [
          { name: "User Text 1", value: titleLine1 },
          { name: "User Text 2", value: titleLine2 },
        ],
      },
    ];
  }

  /**
   * Validates size and product code, then calls the ECS render API.
   * Sets isLoaded to true on success, revealing the editable text fields.
   */
  const handleLookup = useCallback(async (): Promise<void> => {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    if (!isValidItemNumber(productCode)) {
      setError("Please enter a valid Item # / UPC (alphanumeric, max 20 characters).");
      return;
    }

    setError(null);
    setIsLookingUp(true);
    setIsLoaded(false);
    setPreviewBase64(null);

    try {
      const response = await renderCustomSign(buildRenderPayload());
      const firstItem: CustomSignRenderResponseItem | undefined = response?.data?.[0];

      if (!firstItem?.responseData) {
        setError("No preview data returned. Please try again.");
        return;
      }

      setPreviewBase64(firstItem.responseData);
      setIsLoaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lookup failed. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  }, [productCode, size, titleLine1, titleLine2]);

  /**
   * Called onBlur of any editable text field.
   * Re-renders the sign preview with the latest field values.
   */
  const handleFieldBlur = useCallback(async (): Promise<void> => {
    if (!isLoaded) return;

    setError(null);
    setIsRerendering(true);

    try {
      const response = await renderCustomSign(buildRenderPayload());
      const firstItem: CustomSignRenderResponseItem | undefined = response?.data?.[0];

      if (firstItem?.responseData) {
        setPreviewBase64(firstItem.responseData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Preview update failed.");
    } finally {
      setIsRerendering(false);
    }
  }, [isLoaded, productCode, titleLine1, titleLine2]);

  const handlePrint = useCallback(async (): Promise<void> => {
    if (!isLoaded) {
      setError("Please perform a lookup before printing.");
      return;
    }

    setError(null);
    setIsPrinting(true);

    try {
      await printCustomSign(quantity);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Print failed.");
    } finally {
      setIsPrinting(false);
    }
  }, [isLoaded, quantity]);

  // Clears item number, title fields, and preview — but keeps the selected size
  // so the user can immediately look up another item in the same size.
  const handleReset = useCallback((): void => {
    setProductCode("");
    setQuantity(DEFAULT_PRINT_QUANTITY);
    setTitleLine1("");
    setTitleLine2("");
    setPreviewBase64(null);
    setIsLoaded(false);
    setError(null);
    // size is intentionally not cleared
  }, []);

  return {
    productCode,
    size,
    quantity,
    titleLine1,
    titleLine2,
    previewBase64,
    isLoaded,
    isLookingUp,
    isRerendering,
    isPrinting,
    error,
    setProductCode,
    setSize,
    setQuantity,
    setTitleLine1,
    setTitleLine2,
    handleLookup,
    handleFieldBlur,
    handlePrint,
    handleReset,
  };
}

export default useCustomSign;
