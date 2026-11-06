export type AxiRequest = {
  question: string
  context?: string[]
}

export type AxiResponse = {
  answer: string
}

// Backend API call to AXI (currently mocked for testing)
export async function askAxi(request: AxiRequest): Promise<AxiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    answer: `This is a mock answer from AXI for the question: "${request.question}".`,
  }
}