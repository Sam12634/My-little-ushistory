# My Little U.S. History

A learning-focused alchemy-style game where players combine historical concepts to unlock major events, eras, and ideas from U.S. History. Built with a structured database, clean UI organization, and Supabase for data storage.

---

## 🎮 Game Concept

Players start with 10 base elements (Government, Economy, Society/People, etc.) and combine them to create historical events like:

- Constitution  
- Industrial Revolution  
- Civil War  
- Harlem Renaissance  
- New Deal  

As players progress, they unlock more advanced combinations and eventually build a full timeline of U.S. History.

---

## 📁 Project Structure

us-history-alchemy/
│
├── README.md
├── schema/
│   └── schema.sql
│
├── src/
│   ├── game/
│   │   ├── elements.js
│   │   ├── combinations.js
│   │   └── logic.js
│   │
│   ├── ui/
│   │   ├── screens/
│   │   │   ├── MainMenu.js
│   │   │   ├── GameScreen.js
│   │   │   └── ElementListScreen.js
│   │   │
│   │   └── components/
│   │       ├── ElementCard.js
│   │       ├── ComboButton.js
│   │       └── Header.js
│   │
│   └── utils/
│       └── supabaseClient.js
│
└── docs/
    ├── flowchart.md
    ├── database-design.md
    └── element-list.md

---

## 🧱 Database Design

The game uses three main tables:

### **Elements**
Stores all game elements (base, first-tier, second-tier, etc.)

### **Combinations**
Defines which two elements create a new one.

### **User Progress**
Tracks which elements each player has unlocked.

Full SQL schema is in `schema/schema.sql`.

---

## 🔧 Tech Stack

- **Supabase** (database + auth)
- **JavaScript** (game logic)
- **Modular UI structure** (screens + components)
- **GitHub** for version control and documentation

---

## 🚀 Setup Instructions

1. Clone the repository  
2. Create a Supabase project  
3. Paste the SQL schema into the Supabase SQL editor  
4. Add your Supabase URL + anon key to `supabaseClient.js`  
5. Start building game logic in `src/game/`

---

## 📄 Documentation

All design documents live in the `/docs` folder:

- Flowchart  
- Database design  
- Element list  
- Combination logic  

---

## ✨ Future Features

- Full UI for combining elements  
- Progress saving/loading  
- Achievements  
- Era progression  
- Visual element cards  
