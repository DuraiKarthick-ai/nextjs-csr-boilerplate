/**
 * Unit tests for API-to-UI mapping utilities.
 * Verifies that raw domain records are transformed into display-ready
 * view models with correct currency/date formatting and price-delta labels.
 */

import {
  mapSignToViewModel,
  mapSignsToViewModels,
  mapWorklistItemToViewModel,
  mapWorklistItemsToViewModels,
  mapDepartmentsToOptions,
  mapLookupResultToSignPrefill,
} from "./mapper";
import { DEPARTMENTS } from "../lib/constants";
import type { Sign, LookupResult } from "../types/sign.types";
import { SignType } from "../types/sign.types";
import type { WorklistItem } from "../types/worklist.types";
import { WorklistItemStatus, WorklistPrintStatus } from "../types/worklist.types";

const baseSign: Sign = {
  id: "s1",
  title: "Organic Apples",
  subtitle: "Fresh",
  price: 4.5,
  department: "PRODUCE",
  itemNumber: "12345",
  signType: SignType.STANDARD,
  createdAt: "2026-06-19T12:00:00",
  updatedAt: "2026-06-19T12:00:00",
};

const baseWorklistItem: WorklistItem = {
  id: "w1",
  itemNumber: "98765",
  description: "Bananas",
  department: "PRODUCE",
  oldPrice: 2,
  newPrice: 3.5,
  effectiveDate: "2026-06-20T12:00:00",
  status: WorklistItemStatus.PENDING,
  printStatus: WorklistPrintStatus.NOT_PRINTED,
  isPrinted: false,
  createdAt: "2026-06-19T12:00:00",
  updatedAt: "2026-06-19T12:00:00",
};

describe("mapSignToViewModel", () => {
  it("maps all fields and formats price and date", () => {
    const vm = mapSignToViewModel(baseSign);
    expect(vm).toEqual({
      id: "s1",
      title: "Organic Apples",
      subtitle: "Fresh",
      formattedPrice: "$4.50",
      department: "PRODUCE",
      itemNumber: "12345",
      signType: SignType.STANDARD,
      createdAt: "06/19/2026",
    });
  });

  it("defaults a missing subtitle to an empty string", () => {
    const { subtitle, ...rest } = baseSign;
    void subtitle;
    const vm = mapSignToViewModel(rest as Sign);
    expect(vm.subtitle).toBe("");
  });
});

describe("mapSignsToViewModels", () => {
  it("maps an array of signs", () => {
    const result = mapSignsToViewModels([baseSign, { ...baseSign, id: "s2" }]);
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe("s2");
  });

  it("returns an empty array for empty input", () => {
    expect(mapSignsToViewModels([])).toEqual([]);
  });
});

describe("mapWorklistItemToViewModel", () => {
  it("formats a price increase with a leading plus sign", () => {
    const vm = mapWorklistItemToViewModel(baseWorklistItem);
    expect(vm.formattedOldPrice).toBe("$2.00");
    expect(vm.formattedNewPrice).toBe("$3.50");
    expect(vm.priceDeltaLabel).toBe("+$1.50");
    expect(vm.effectiveDate).toBe("06/20/2026");
  });

  it("formats a price decrease without a plus sign (currency carries the minus)", () => {
    const vm = mapWorklistItemToViewModel({
      ...baseWorklistItem,
      oldPrice: 5,
      newPrice: 3,
    });
    expect(vm.priceDeltaLabel).toBe("-$2.00");
  });

  it("carries through status and print flags", () => {
    const vm = mapWorklistItemToViewModel(baseWorklistItem);
    expect(vm.status).toBe(WorklistItemStatus.PENDING);
    expect(vm.printStatus).toBe(WorklistPrintStatus.NOT_PRINTED);
    expect(vm.isPrinted).toBe(false);
  });
});

describe("mapWorklistItemsToViewModels", () => {
  it("maps an array of worklist items", () => {
    const result = mapWorklistItemsToViewModels([baseWorklistItem]);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Bananas");
  });
});

describe("mapDepartmentsToOptions", () => {
  it("maps every department to a label/value option", () => {
    const options = mapDepartmentsToOptions();
    expect(options).toHaveLength(Object.keys(DEPARTMENTS).length);
    expect(options).toContainEqual({ value: "PRODUCE", label: "Produce" });
  });
});

describe("mapLookupResultToSignPrefill", () => {
  it("maps a lookup result to sign prefill data", () => {
    const lookup: LookupResult = {
      itemNumber: "55555",
      description: "Whole Milk",
      department: "DAIRY",
      price: 3.25,
      found: true,
    };
    expect(mapLookupResultToSignPrefill(lookup)).toEqual({
      title: "Whole Milk",
      price: 3.25,
      department: "DAIRY",
      itemNumber: "55555",
    });
  });
});
