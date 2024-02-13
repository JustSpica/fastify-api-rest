import { execSync } from "node:child_process";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "../src/app";

describe("transactions endpoints", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able for the user to create a new transaction", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      });

    expect(createTransactionsResponse.statusCode).toEqual(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    ]);

    expect(listTransactionsResponse.status).toEqual(200);
  });

  it("should be able to list a transaction by your id", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionByIdResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies);

    expect(getTransactionByIdResponse.status).toEqual(200);

    expect(getTransactionByIdResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId,
        title: "New transaction",
        amount: 5000,
      }),
    );
  });

  it("should be able for the user to get your summary", async () => {
    const creditTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transaction",
        amount: 1000,
        type: "credit",
      });

    const cookies = creditTransactionResponse.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: 200,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies);

    expect(summaryResponse.status).toEqual(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 800,
    });
  });
});
