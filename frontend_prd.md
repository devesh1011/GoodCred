
### ## Main Website Layout

Every page on the site shares a consistent and simple layout to make navigation easy.

* **Header:** At the top of every page, you'll see the **GoodCred logo** on the left. On the right, there's a single, clear button. Initially, it says **"Connect Wallet."** Once you're connected, this button will show a shortened version of your wallet address (e.g., `0x123...4567`).
* **Footer:** At the very bottom of each page, you'll find links to pages like "About Us," "How It Works," and our social media channels.

/app
|-- /dashboard
|   |-- page.tsx        # Dashboard UI (Client Component)
|   `-- layout.tsx      # Layout specific to the dashboard
|-- /quests
|   `-- page.tsx        # Quests UI (Client Component)
|-- /lending
|   `-- page.tsx        # Lending UI (Client Component)
|
|-- layout.tsx          # Root layout (Header, Footer, Context Providers)
`-- page.tsx            # The public landing page (Server Component)
/components
|-- /ui                 # General UI elements (Button, Modal - Client Components)
`-- /sections           # Larger page sections (HeroSection - Server Component)
/contexts               # Client-side contexts (AuthContext, GoodCredContext)
/hooks                  # Client-side hooks (useContracts, useGoodCredData)
/lib                    # Utility functions, constants (ABIs, addresses)
/services               # Logic for external services (GoodID, Reclaim)
/public                 # Static assets (images, fonts)

---

### ## Landing Page

This is the first page new visitors see. Its goal is to be welcoming, informative, and encourage people to get started. 🤝

* **Main Section:** The page opens with a large, inviting headline like **"Build Your On-Chain Credit. Unlock Your Financial Future."** Below it, a short sentence explains what GoodCred does. The most prominent element is the main button: **"Create My Score."** This is the starting point for every new user.
    
* **How It Works:** Scrolling down, you'll find a simple, visual guide with three steps:
    1.  **Verify Your Identity:** Shows how you'll use a quick, private face scan to prove you're a unique person.
    2.  **Build Your Score:** Explains that you can complete simple tasks, or "Quests," to increase your score.
    3.  **Unlock Loans:** Shows the end benefit—getting access to small loans in G$.
* **Featured Quests:** This section gives you a sneak peek at the kinds of tasks you can complete, like "Provide G$ on Ubeswap" or "Verify your financial literacy certificate," making the concept of building a score feel tangible and achievable.

---

### ## Dashboard

Once you've created your profile, this is your personal homepage. It gives you a complete overview of your status at a glance. 📊

* **Your GoodCred Score:** The first thing you'll see is a large, circular gauge in the center of the page, proudly displaying your current score (e.g., **"550"**). This visual is designed to be motivating and easy to understand. Next to your score, you'll see a green **"Verified ✓"** badge, confirming your identity is secure.
* **Loan Status:** A simple box clearly tells you about your loan situation.
    * **If you have a loan:** It will show the **"Amount Due,"** the **"Repayment Deadline,"** and a clear **"Repay Now"** button.
    * **If you don't have a loan:** It will display a friendly message like "You have no active loans" and a button to **"Explore Loans."**
* **Quests Summary:** A small card shows your progress, for example, **"5 of 20 Quests Completed,"** with a button that encourages you to **"View All Quests."**
* **Recent Activity:** Below your main score, you'll find a simple feed of your recent achievements, such as "+50 Points: Quest 'Loan Repaid' Completed."

---

### ## Quests Page

This is where the action happens! This page is designed as a clear to-do list for increasing your score. ✅

* **Quest Filters:** At the top, you can click on simple filters like **"All,"** **"On-Chain,"** and **"Off-Chain"** to easily find the types of tasks you want to do.
* **List of Quests:** The main part of the page is a list of individual "Quest Cards." Each card clearly shows:
    * **The Task:** A simple description like "Vote in a GoodDAO proposal."
    * **The Reward:** How many points you'll earn, e.g., **"+25 Points."**
    * **An Action Button:** The button's text changes depending on the status. It will say **"Start Task,"** **"Verify,"** or show a checkmark and the word **"Completed"** if you're already done.

---

### ## Lending Page

This page is for managing loans. The design is simple and focuses on clarity to ensure you feel confident and in control. 💰

* **Borrowing Section:**
    * **Eligibility Status:** The first thing you see is a clear message stating whether you are eligible for a loan. It will show your **"Maximum Loan Amount"** based on your score. If you aren't eligible yet, it will tell you the score you need to reach.
    * **Loan Form:** If you're eligible, a simple form appears. You just type in the amount of G$ you'd like to borrow. The form automatically calculates and displays the small fee and the **"Total Repayment Amount."** The only other thing on the screen is a big **"Confirm Loan"** button.
* **Support the Pool Section:**
    * This is a separate area for users who want to contribute G$ to the lending pool to help others and earn interest. It shows interesting stats like the **"Total G$ in the Pool"** and provides a simple form to deposit funds.