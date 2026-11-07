import express from 'express';
import { Agent, run } from "@openai/agents";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import { z } from 'zod';

// const elevenlabs = new ElevenLabsClient();

const app = express();
app.use(express.json());

app.get('/api/agent-session', async (req, res) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.AGENT_ID}`,
    {
      method: "GET",
      headers: {
        // Requesting a signed url requires your ElevenLabs API key
        // Do NOT expose your API key to the client!
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    return res.status(500).send("Failed to get signed URL");
  }
  const body = await response.json();
  res.send(body.signedUrl);
});

const PlanSteps = z.object({
  "steps": z.array(
    z.object({
      title: z.string(),
      due: z.string().describe("An ISO 8601 formatted due date"),
    })
  )
});

const plannerAgent = new Agent({
  name: "Student Planner Help",
  instructions: "You create steps to go into a student revision/lifestyle planner calendar.",
  model: "gpt-6-astra",
  outputType: PlanSteps,
});

app.get('/api/plan', async (req, res) => {
  const { goal, deadline, now } = req.body;

  const result = await run(plannerAgent, `Create a set of steps for the goal:\n\n${goal}\nDEADLINE: ${deadline}\nNOW: ${now}`);
  const { steps } = result.finalOutput;

  res.json(steps);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
