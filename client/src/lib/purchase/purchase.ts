import { writable } from "svelte/store";
import { gameState } from "../ui-logic/state";
import {
  IAPProduct,
  InAppPurchase2 as payments,
} from "@awesome-cordova-plugins/in-app-purchase-2";

export type PurchaseStatus =
  | {
      type: "None";
    }
  | {
      type: "Pending";
      gems: number;
    }
  | {
      type: "Cancelled";
      gems: number;
    }
  | {
      type: "Failed";
      gems: number;
    }
  | {
      type: "Finished";
      gems: number;
    };
export const purchaseStatus = writable<PurchaseStatus>({ type: "None" });

export interface PurchaseOption {
  productId: string;
  name: string;
  gems: number;
  description: string;
  previousPrice?: string;
  price: string;
  currency: string;
}
export let gemsByProduct: { [name: string]: number } = {
  "starter-v1": 1,
  "medium-v1": 20,
  "large-v1": 100,
};

export let products = ["starter-v1", "medium-v1", "large-v1"];

export let productData: { [name: string]: PurchaseOption } = {};

payments.register([
  {
    type: payments.CONSUMABLE,
    id: "starter-v1",
  },
]);

// payments
//   .when("product")
//   .registered(productUpdated)
//   .updated(productUpdated)
//   .approved(approved);

payments.refresh();

export function makePurchase(name: string) {
  const product = payments.get(name);
  const gems = gemsByProduct[product.alias];
  purchaseStatus.set({
    type: "Pending",
    gems,
  });
  payments.order(product);
}

function productUpdated(product: IAPProduct) {
  const gems = gemsByProduct[product.alias];
  productData[product.alias] = {
    productId: product.id,
    price: product.price,
    description: product.description,
    currency: product.currency,
    name: product.title,
    gems: gems,
  };
}

function approved(product: IAPProduct) {
  const gems = gemsByProduct[product.alias];
  gameState.update((prev) => {
    prev.gems += gems;
    return prev;
  });
  product.verify();
  purchaseStatus.set({
    type: "Finished",
    gems,
  });
}

function verify(product: IAPProduct) {
  product.finish();
}

export function restorePurchases() {
  payments.refresh();
}
