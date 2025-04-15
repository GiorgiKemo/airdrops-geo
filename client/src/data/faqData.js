/**
 * FAQ data organized by page
 * Each page has an array of question objects with question and answer properties
 */

export const faqData = {
  // Home page FAQs
  home: [
    {
      question: "What are crypto airdrops?",
      answer: "Crypto airdrops are free distributions of tokens or coins by blockchain projects to community members. They're typically used to increase awareness, reward users, or distribute tokens widely."
    },
    {
      question: "Are airdrops really free?",
      answer: "Most airdrops are free in terms of monetary cost, but they often require some action like signing up, completing tasks, or holding certain tokens. Some may also require gas fees for claiming on certain blockchains."
    },
    {
      question: "How do I qualify for airdrops?",
      answer: "Qualification criteria vary by project. Common requirements include holding specific tokens, using a protocol, completing social media tasks, or being an early adopter. Check each airdrop's specific requirements on its detail page."
    },
    {
      question: "Are airdrops safe?",
      answer: "While many airdrops are legitimate, always exercise caution. Never share your private keys or seed phrases, be wary of connecting to unknown websites, and research projects thoroughly before participating."
    },
    {
      question: "How do I track my claimed airdrops?",
      answer: "You can track your claimed airdrops by creating an account and using the 'My Airdrops' feature, which allows you to save and monitor airdrops you're interested in or have participated in."
    }
  ],
  
  // Airdrop detail page FAQs
  airdropDetail: [
    {
      question: "How do I claim this airdrop?",
      answer: "Follow the specific instructions provided in the airdrop details. Typically, this involves connecting your wallet to the project's website, completing required tasks, and submitting your wallet address."
    },
    {
      question: "When will I receive the tokens?",
      answer: "Distribution timelines vary by project. Some airdrops distribute tokens immediately after claiming, while others may have a scheduled distribution date after the claiming period ends. Check the airdrop details for specific timing information."
    },
    {
      question: "What wallet should I use for this airdrop?",
      answer: "Most airdrops require an ERC-20 compatible wallet (for Ethereum-based tokens) or a blockchain-specific wallet. Popular options include MetaMask, Trust Wallet, or Coinbase Wallet. Always ensure your wallet supports the token's blockchain."
    },
    {
      question: "Why haven't I received my tokens yet?",
      answer: "Token distribution can take time. If you've completed all requirements but haven't received tokens, check the project's official channels for updates on distribution timelines. Some projects distribute in batches or have delays due to high participation."
    }
  ],
  
  // Dashboard (My Airdrops) FAQs
  dashboard: [
    {
      question: "How do I add airdrops to my dashboard?",
      answer: "You can add airdrops to your dashboard by clicking the star icon or 'Track' button on any airdrop card or detail page. This allows you to keep track of airdrops you're interested in."
    },
    {
      question: "Can I get notifications for my tracked airdrops?",
      answer: "Yes, you can receive notifications for status changes and updates to your tracked airdrops. Make sure to enable notifications in your account settings."
    },
    {
      question: "How do I remove an airdrop from my dashboard?",
      answer: "To remove an airdrop from your dashboard, simply click the star icon again or use the 'Untrack' button on the airdrop card or detail page."
    },
    {
      question: "Can I see my claiming history?",
      answer: "Yes, your dashboard shows all airdrops you've tracked, including their current status. You can use this to keep track of which airdrops you've claimed and which are still pending."
    }
  ],
  
  // Admin page FAQs
  admin: [
    {
      question: "How do I add a new airdrop?",
      answer: "Use the 'Add New Airdrop' form in the admin panel. Fill in all required fields including title, description, eligibility criteria, and relevant links. You can also upload a logo image for the airdrop."
    },
    {
      question: "How do I update an existing airdrop?",
      answer: "Find the airdrop in the admin list, then click the 'Edit' button. Make your changes in the form that appears and save them. You can update any field including status, dates, and requirements."
    },
    {
      question: "How do I send notifications about airdrop updates?",
      answer: "When updating an airdrop, you can choose to send a notification to users who are tracking it. Simply check the 'Notify Users' option before saving your changes."
    },
    {
      question: "Can I delete an airdrop?",
      answer: "Yes, you can delete an airdrop by clicking the 'Delete' button next to it in the admin list. Note that this action is permanent and will remove the airdrop from all users' dashboards."
    }
  ]
};

export default faqData;
