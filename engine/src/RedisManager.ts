import { RedisClientType, createClient } from "redis";
import { ORDER_UPDATE, ORDER_CREATE, TRADE_ADDED } from "./types";
import { WsMessage } from "./types/toWs";
import { MessageToApi } from "./types/toApi";

type DbMessage =
  | {
      type: typeof TRADE_ADDED;
      data: {
        id: string;
        isBuyerMaker: boolean;
        price: string;
        quantity: string;
        quoteQuantity: string;
        timestamp: number;
        market: string;
      };
    }
  | {
      type: typeof ORDER_CREATE;
      data: {
        orderId: string;
        executedQty: number;
        market: string;
        price: string;
        quantity: string;
        side: "buy" | "sell";
      };
    }
  | {
      type: typeof ORDER_UPDATE;
      data: {
        orderId: string;
        executedQty: number;
      };
    };

export class RedisManager {
  private client: RedisClientType;
  private static instance: RedisManager;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  public pushMessage(message: DbMessage) {
    this.client.lPush("db_processor", JSON.stringify(message));
  }

  public publishMessage(channel: string, message: WsMessage) {
    this.client.publish(channel, JSON.stringify(message));
  }

  public sendToApi(clientId: string, message: MessageToApi) {
    this.client.publish(clientId, JSON.stringify(message));
  }

  public async keyExists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  public async addhSetData(
    key: string,
    data: Record<string, string>
  ): Promise<void> {
    await this.client.hSet(key, data);
  }

  public async gethSetField(
    key: string,
    field: string
  ): Promise<string | null> {
    return (await this.client.hGet(key, field)) ?? null;
  }

  public async updatehSetField(key: string, field: string, value: string) {
    return await this.client.hSet(key, field, value);
  }

  public async getAllhSetData(key: string): Promise<{ [x: string]: string }> {
    return await this.client.hGetAll(key);
  }
}
