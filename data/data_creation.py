import json
import random

# --- CONFIGURATION ---
NUM_SAMPLES = 10000  # Total rows to generate
OUTPUT_FILE = "legal_finetune_dataset.json"

# --- 1. DATA SOURCE: REAL INDIAN LAWS (Truth Source) ---
# We use a dictionary so the AI learns FACTS, not hallucinations.
indian_laws = [
    # --- INDIAN PENAL CODE (CRIMINAL) ---
    {"act": "Indian Penal Code (IPC)", "section": "302", "desc": "Punishment for murder", "punishment": "Death or imprisonment for life and fine"},
    {"act": "Indian Penal Code (IPC)", "section": "307", "desc": "Attempt to murder", "punishment": "Imprisonment up to 10 years and fine (Life if hurt is caused)"},
    {"act": "Indian Penal Code (IPC)", "section": "379", "desc": "Punishment for theft", "punishment": "Imprisonment up to 3 years, or fine, or both"},
    {"act": "Indian Penal Code (IPC)", "section": "420", "desc": "Cheating and dishonestly inducing delivery of property", "punishment": "Imprisonment up to 7 years and fine"},
    {"act": "Indian Penal Code (IPC)", "section": "498A", "desc": "Husband or relative of husband of a woman subjecting her to cruelty", "punishment": "Imprisonment up to 3 years and fine"},
    {"act": "Indian Penal Code (IPC)", "section": "500", "desc": "Punishment for defamation", "punishment": "Simple imprisonment up to 2 years, or fine, or both"},
    {"act": "Indian Penal Code (IPC)", "section": "304A", "desc": "Causing death by negligence", "punishment": "Imprisonment up to 2 years, or fine, or both"},
    {"act": "Indian Penal Code (IPC)", "section": "124A", "desc": "Sedition", "punishment": "Imprisonment for life, to which fine may be added, or up to 3 years + fine"},
    {"act": "Indian Penal Code (IPC)", "section": "376", "desc": "Punishment for rape", "punishment": "Rigorous imprisonment of not less than 10 years, extending to life"},
    {"act": "Indian Penal Code (IPC)", "section": "354", "desc": "Assault or criminal force to woman with intent to outrage her modesty", "punishment": "Imprisonment 1 to 5 years and fine"},
    {"act": "Indian Penal Code (IPC)", "section": "406", "desc": "Punishment for criminal breach of trust", "punishment": "Imprisonment up to 3 years, or fine, or both"},
    {"act": "Indian Penal Code (IPC)", "section": "191", "desc": "Giving false evidence (Perjury)", "punishment": "Imprisonment up to 7 years and fine"},
    {"act": "Indian Penal Code (IPC)", "section": "144", "desc": "Joining unlawful assembly armed with deadly weapon", "punishment": "Imprisonment up to 2 years, or fine, or both"},
    
    # --- INDIAN CONTRACT ACT (CIVIL) ---
    {"act": "Indian Contract Act, 1872", "section": "10", "desc": "What agreements are contracts", "punishment": "N/A (Voidability or Validity determined)"},
    {"act": "Indian Contract Act, 1872", "section": "11", "desc": "Who are competent to contract", "punishment": "N/A (Contract becomes Void)"},
    {"act": "Indian Contract Act, 1872", "section": "56", "desc": "Agreement to do impossible act (Frustration of Contract)", "punishment": "N/A (Contract becomes Void)"},
    {"act": "Indian Contract Act, 1872", "section": "73", "desc": "Compensation for loss or damage caused by breach of contract", "punishment": "Monetary Damages (Compensation)"},
    {"act": "Indian Contract Act, 1872", "section": "74", "desc": "Compensation for breach of contract where penalty stipulated", "punishment": "Reasonable Compensation not exceeding penalty stipulated"},
    {"act": "Indian Contract Act, 1872", "section": "124", "desc": "Contract of Indemnity defined", "punishment": "N/A (Liability to indemnify)"},
    {"act": "Indian Contract Act, 1872", "section": "172", "desc": "Pledge, Pawnor, and Pawnee defined", "punishment": "N/A (Rights of sale/retention)"},

    # --- CONSTITUTION OF INDIA (CONSTITUTIONAL) ---
    {"act": "Constitution of India", "section": "Article 14", "desc": "Equality before law", "punishment": "N/A (Fundamental Right Violation)"},
    {"act": "Constitution of India", "section": "Article 19", "desc": "Protection of certain rights regarding freedom of speech", "punishment": "N/A (Fundamental Right Violation)"},
    {"act": "Constitution of India", "section": "Article 21", "desc": "Protection of life and personal liberty", "punishment": "N/A (Fundamental Right Violation)"},
    {"act": "Constitution of India", "section": "Article 32", "desc": "Remedies for enforcement of rights (Writ Jurisdiction of SC)", "punishment": "N/A (Judicial Remedy)"},
    {"act": "Constitution of India", "section": "Article 226", "desc": "Power of High Courts to issue certain writs", "punishment": "N/A (Judicial Remedy)"},

    # --- CORPORATE & SPECIAL ACTS ---
    {"act": "Companies Act, 2013", "section": "447", "desc": "Punishment for fraud", "punishment": "Imprisonment 6 months to 10 years and fine up to 3x fraud amount"},
    {"act": "Companies Act, 2013", "section": "135", "desc": "Corporate Social Responsibility (CSR)", "punishment": "Penalty on company and officers for non-compliance"},
    {"act": "Negotiable Instruments Act", "section": "138", "desc": "Dishonour of cheque for insufficiency of funds", "punishment": "Imprisonment up to 2 years or fine up to twice the amount"},
    {"act": "Consumer Protection Act, 2019", "section": "89", "desc": "Punishment for false or misleading advertisement", "punishment": "Imprisonment up to 2 years and fine up to 10 Lakhs"},
    
    # --- IT ACT (CYBER) ---
    {"act": "Information Technology Act, 2000", "section": "66C", "desc": "Punishment for identity theft", "punishment": "Imprisonment up to 3 years and fine up to 1 Lakh"},
    {"act": "Information Technology Act, 2000", "section": "66D", "desc": "Punishment for cheating by personation by using computer resource", "punishment": "Imprisonment up to 3 years and fine up to 1 Lakh"},
    {"act": "Information Technology Act, 2000", "section": "66E", "desc": "Punishment for violation of privacy", "punishment": "Imprisonment up to 3 years or fine up to 2 Lakhs"},
    {"act": "Information Technology Act, 2000", "section": "66F", "desc": "Punishment for cyber terrorism", "punishment": "Imprisonment for life"},
    {"act": "Information Technology Act, 2000", "section": "67", "desc": "Publishing or transmitting obscene material in electronic form", "punishment": "Imprisonment up to 3 years and fine up to 5 Lakhs (First conviction)"},

    # --- NARCOTICS (NDPS) ---
    {"act": "NDPS Act, 1985", "section": "20", "desc": "Punishment for contravention in relation to cannabis plant and cannabis", "punishment": "Rigorous imprisonment up to 10 years + Fine (Small qty)"},
    {"act": "NDPS Act, 1985", "section": "21", "desc": "Punishment for contravention in relation to manufactured drugs and preparations", "punishment": "Depends on quantity (Small/Commercial)"},

    # --- FAMILY & MISC ---
    {"act": "Hindu Marriage Act, 1955", "section": "13", "desc": "Grounds for Divorce", "punishment": "N/A (Dissolution of Marriage)"},
    {"act": "Hindu Marriage Act, 1955", "section": "9", "desc": "Restitution of conjugal rights", "punishment": "N/A (Decree of Restitution)"},
    {"act": "Code of Criminal Procedure (CrPC)", "section": "125", "desc": "Order for maintenance of wives, children and parents", "punishment": "Imprisonment for breach of order"},
    {"act": "Code of Criminal Procedure (CrPC)", "section": "438", "desc": "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)", "punishment": "N/A (Procedural Relief)"},
    {"act": "Prevention of Corruption Act", "section": "7", "desc": "Public servant taking gratification other than legal remuneration", "punishment": "Imprisonment 3 to 7 years and fine"},
    {"act": "Motor Vehicles Act", "section": "185", "desc": "Driving by a drunken person or under the influence of drugs", "punishment": "Imprisonment up to 6 months or fine up to 10,000 (First Offense)"},
    {"act": "Copyright Act, 1957", "section": "63", "desc": "Offence of infringement of copyright", "punishment": "Imprisonment 6 months to 3 years and fine 50k to 2 Lakhs"},
    {"act": "Arms Act, 1959", "section": "25", "desc": "Punishment for certain offences (Illegal possession of arms)", "punishment": "Imprisonment 3 to 7 years and fine"}
]

# --- 2. GENERATOR FUNCTIONS ---

def generate_penalty_task():
    """Generates a math-based legal penalty problem."""
    
    contract_val = random.randrange(100000, 10000000, 50000) # Random value 1L to 1Cr
    delay_days = random.randint(1, 60)
    penalty_rate = random.choice([0.1, 0.5, 1.0, 1.5, 2.0]) # Percentage
    
    # Calculate truth
    daily_penalty = int(contract_val * (penalty_rate / 100))
    total_penalty = daily_penalty * delay_days
    
    instruction = f"Calculate the total penalty for a project with a Contract Value of INR {contract_val:,}. The delay is {delay_days} days and the penalty rate is {penalty_rate}% per day."
    
    response = (
        f"Step 1: Calculate daily penalty.\n"
        f"   {contract_val:,} * {penalty_rate}% = {daily_penalty:,} INR per day.\n"
        f"Step 2: Calculate total penalty for delay.\n"
        f"   {daily_penalty:,} * {delay_days} days = {total_penalty:,} INR.\n\n"
        f"The total penalty amount is INR {total_penalty:,}."
    )
    
    return {
        "instruction": instruction,
        "input": "",
        "response": response,
        "category": "Penalty Calculation"
    }

def generate_law_qa():
    """Generates variations of questions asking about specific laws."""
    law = random.choice(indian_laws)
    
    # Randomize the phrasing to prevent overfitting
    templates = [
        f"What is the punishment defined under Section {law['section']} of the {law['act']}?",
        f"Explain Section {law['section']} of the {law['act']}.",
        f"Under the {law['act']}, which section deals with '{law['desc']}'?",
        f"If a person is charged under Section {law['section']} ({law['act']}), what is the potential penalty?"
    ]
    
    query = random.choice(templates)
    
    # Formulate answer based on the query type
    if "which section" in query.lower():
        ans = f"Section {law['section']} of the {law['act']} deals with {law['desc']}."
    else:
        ans = f"Section {law['section']} of the {law['act']} relates to {law['desc']}. The prescribed consequence is {law['punishment']}."

    return {
        "instruction": query,
        "input": "",
        "response": ans,
        "category": "Statutory Interpretation"
    }

def generate_clause_extraction():
    """Generates simple extraction tasks with random variables."""
    parties = ["Acme Corp", "Beta Ltd", "Gamma Sol", "Delta Pvt Ltd"]
    dates = ["1st Jan 2024", "31st March 2025", "15th August 2024"]
    cities = ["Mumbai", "Delhi", "Bangalore", "Chennai"]
    
    p1 = random.choice(parties)
    p2 = random.choice(parties)
    while p1 == p2: p2 = random.choice(parties)
    city = random.choice(cities)
    
    text = f"This Lease Agreement is made in {city} between {p1} (Lessor) and {p2} (Lessee). The jurisdiction for any disputes arising shall be the courts of {city} exclusively."
    
    return {
        "instruction": "Extract the jurisdiction clause and the city from the text.",
        "input": text,
        "response": f"The jurisdiction clause states that disputes are subject to the exclusive jurisdiction of the courts of {city}.",
        "category": "Clause Extraction"
    }

# --- 3. MAIN LOOP ---

dataset = []

print(f"Generating {NUM_SAMPLES} legal data points...")

for _ in range(NUM_SAMPLES):
    # Randomly choose a task type
    task_type = random.choice(["math", "law", "law", "clause"]) # Weigh 'law' higher if needed
    
    if task_type == "math":
        data = generate_penalty_task()
    elif task_type == "clause":
        data = generate_clause_extraction()
    else:
        data = generate_law_qa()
        
    dataset.append(data)

# --- 4. SAVE TO FILE ---
with open(OUTPUT_FILE, "w", encoding='utf-8') as f:
    json.dump(dataset, f, indent=2)

print(f"✅ Success! Saved {len(dataset)} rows to '{OUTPUT_FILE}'.")
print("Here is a sample entry:")
print(json.dumps(dataset[0], indent=2))