const test = require("node:test");
const assert = require("node:assert/strict");
const { PAYMENT_METHODS, ORDER_STATUSES } = require("../services/orderService");

test("accepted payment methods are explicitly allowlisted", () => {
  assert.deepEqual(PAYMENT_METHODS, ["cod", "online", "fampay"]);
  assert.equal(PAYMENT_METHODS.includes("crypto"), false);
});

test("order lifecycle is explicitly allowlisted", () => {
  assert.equal(ORDER_STATUSES.includes("pending"), true);
  assert.equal(ORDER_STATUSES.includes("delivered"), true);
  assert.equal(ORDER_STATUSES.includes("random"), false);
});
