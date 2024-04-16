"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get('/agents', async (req, res, next) => {
    try {
        const response = await axios_1.default.get('https://valorant-api.com/v1/agents');
        const agents = response.data.data;
        // Filter and map the agents array to only include specific properties
        const filteredAgents = agents.filter((agent) => agent.isPlayableCharacter).map((agent) => {
            return {
                uuid: agent.uuid,
                displayName: agent.displayName,
                displayIcon: agent.displayIcon
            };
        });
        // Send the filtered data as a JSON response
        res.json(filteredAgents);
    }
    catch (error) {
        next(error); // Pass errors to the error-handling middleware
    }
});
exports.default = router;
