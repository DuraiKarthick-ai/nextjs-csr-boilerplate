/**
 * Type definitions for Sign domain entities.
 * Covers standard signs, custom signs, print requests, lookups,
 * and related enumerations used throughout the Sign Management feature.
 */

import { BaseEntity } from "./common.types";

/**
 * Enum representing the category/type of a sign.
 */
export enum SignType {
  STANDARD = "STANDARD",
  SALE = "SALE",
  CLEARANCE = "CLEARANCE",
  CUSTOM = "CUSTOM",
}

/**
 * Enum representing the current print job status.
 */
export enum PrintStatus {
  QUEUED = "QUEUED",
  PRINTING = "PRINTING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * Represents a persisted sign record from the backend.
 */
export interface Sign extends BaseEntity {
  title: string;
  subtitle?: string;
  price: number;
  department: string;
  itemNumber: string;
  signType: SignType;
}

/**
 * Payload used to create or preview a custom sign.
 */
export interface CustomSign {
  title1: string;
  title2?: string;
  title3?: string;
  price: number;
  signType: SignType;
  department: string;
}

/**
 * Request body for submitting one or more signs to a print queue.
 */
export interface PrintRequest {
  signIds: string[];
  quantity: number;
  printerQueue?: string;
}

/**
 * Response returned after submitting a print request.
 */
export interface PrintResponse {
  jobId: string;
  status: PrintStatus;
  message: string;
}

/**
 * Result returned from an item number lookup.
 */
export interface LookupResult {
  itemNumber: string;
  description: string;
  department: string;
  price: number;
  found: boolean;
}

/**
 * Quick-print entry representing a sign item queued for immediate printing.
 */
export interface QuickPrintItem {
  itemNumber: string;
  description: string;
  department: string;
  price: number;
  quantity: number;
}

/**
 * A single name/value pair sent to the ECS render API to populate sign fields.
 */
export interface ShapeNameValue {
  name: string;
  value: string;
}

/**
 * Request item sent to the ECS custom-sign render endpoint.
 * Wrapped in an array when submitted.
 */
export interface CustomSignRenderRequest {
  styleName: string;
  outputType: string;
  productCode: string;
  storeId: number;
  outputParams: string;
  shapeNameValues: ShapeNameValue[];
}

/**
 * A single rendered sign item returned by the ECS render endpoint.
 * responseData is a base-64 encoded PNG image.
 */
export interface CustomSignRenderResponseItem {
  responseData: string;
  hashCode: string;
  physicalWidth: number;
  physicalHeight: number;
}

/**
 * Full envelope returned by the ECS custom-sign render endpoint.
 */
export interface CustomSignRenderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CustomSignRenderResponseItem[];
  timestamp: string;
}
