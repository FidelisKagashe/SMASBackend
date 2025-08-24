// src/index.ts

import dotenv from "dotenv";
dotenv.config(); 

import express, { Application } from "express";
import cors from "cors";
import serverEntrance from "./middleware";
import applicationRoutes from "./routes/index";
import { createSystemAccount } from "./helpers";   
import { helpers, startServer, mongoose, fileUpload } from "bapig";

// Initialize Express
const app: Application = express();

// Security middleware
app.disable("x-powered-by");
app.use(cors({ origin: "*" }));

// Body parsing
app.use(express.json({ limit: "1000mb" }));

// Static files
app.use(express.static(helpers.staticFilesDirectory));

// File uploads
app.use(fileUpload());

// Request logging
app.use(serverEntrance);

// API routes
app.use("/api", applicationRoutes);

// On MongoDB connected
mongoose.connection.on("connected", async () => {
  require("./database/collections");
  require("./helpers/dailyActivity");
  createSystemAccount()
});

// Start server (with clustering)
startServer(app);
