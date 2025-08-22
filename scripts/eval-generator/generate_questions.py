import openai
import base64
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2025-01-01-preview",
)

image_folder = ".\\output_images"

# Encode image as base64 string
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('ascii')

prompt ="""
    There is an AI system used by insurance underwriters working for an insurance company.
	The AI system is used to help underwriters answer questions from the product manuals.
	
	Your task is to write question/answer pairs that will be used to evaluate the
	performance of that AI system. All the questions you write will be about actual underwriting rules, and other underwriting materical based on information from the underwriting manuals. The
	questions should plausibly represent what underwriters will ask.
	
	In this case, you are to write a question/answer pair based on the attached image
	
	Questions are one of the following types:
	- Questions about how base rates vary by territory, how increased limit factors are applied, and how overall premiums are calculated.
	- Questions focused on differences across territories, reasons for rate variations, and implications for underwriting risk.
	- Questions relating to the impact of increased limit factors on coverage options, affordability, and policyholder choices.
    - Questions about definitions of rules, classifications, territories, etc.

	You must select an OBJECTIVE FACT from the manual and write a question to which
	that fact is the answer. Only select facts that are distinctive about this specific part,
	not generic information.
	
	Always follow these style guidelines:
	 - Questions are short, typically 3-9 words, and are not always full sentences. They may look
	 like search queries or things typed in a hurry by a support agent. They are not polite or
	 verbose, since they are addressed to a machine.
	 Example questions might be "Good Student Discount", "U-Haul", "what about glass damage?",
	 "what is pleasure use?", "discount for having home and auto?"
	 - Answers are short, typically a single brief sentence of 1-10 words. Never use more than
	   20 words for an answer.
	 - The "verbatim_quote_from_manual" is 3-6 words taken EXACTLY from the manual which are
	   the factual basis for the question and answer.
	 - If the provided context does not contain a suitable fact, set all the response properties
	   to null or empty strings.
	
	Please create 5 question and answer pairs.
	
	Respond as JSON in the following form for each question answer pair: [
        {
            "question": "string",
            "answer": "string",
            "verbatimQuoteFromManual": "string"
        },
        {
            "question": "string",
            "answer": "string",
            "verbatimQuoteFromManual": "string"
        }
    ]
"""

# Loop through PNG images in the folder
for filename in os.listdir(image_folder):
    if filename.lower().endswith(".png"):
        image_path = os.path.join(image_folder, filename)
        base64_image = encode_image(image_path)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=300
        )
        print(f"Image: {filename}\n{response.choices[0].message.content}\n")

        # Write response to a file in the ./questions folder
        questions_folder = "./questions"
        os.makedirs(questions_folder, exist_ok=True)
        output_file = os.path.join(questions_folder, f"{filename[:-4]}_questions.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(response.choices[0].message.content)
