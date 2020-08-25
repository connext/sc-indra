import "reflect-metadata";
import { container } from "tsyringe";
import { MessageRouter } from "./message-router";

const messageRouter = container.resolve(MessageRouter);
