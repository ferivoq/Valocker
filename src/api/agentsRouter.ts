import express from 'express';
import axios from 'axios';

// Define a TypeScript interface for the agent data structure
interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  isPlayableCharacter: boolean;
}

const router = express.Router();

router.get('/agents', async (req, res, next) => {
  try {
    const response = await axios.get<{ status: number; data: Agent[] }>('https://valorant-api.com/v1/agents');
    const agents = response.data.data;

    // Filter and map the agents array to only include specific properties
    const filteredAgents = agents.filter((agent: Agent) => agent.isPlayableCharacter).map((agent: Agent) => {
      return {
        uuid: agent.uuid,
        displayName: agent.displayName,
        displayIcon: agent.displayIcon
      };
    });

    // Send the filtered data as a JSON response
    res.json(filteredAgents);
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
});

export default router;
