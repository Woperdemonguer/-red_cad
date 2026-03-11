# RedCAD Hub MVP — Walkthrough

🎉 The Phase 1 MVP for the RedCAD Hub has been successfully built and is running locally!

## What was built
This phase focused on digitizing the 63-question diagnostic form for the CAD network, transitioning it from a manual process into a secure, database-backed web application.

### Key Features Implemented:
1. **Next.js & Tailwind CSS Architecture:** A fast, modern React web application styled precisely to the "RedCAD" aesthetic (Forest, Sage, Cream, Sand).
2. **Interactive Form Blocks:** The form is divided into 8 logical, easy-to-digest blocks.
3. **Advanced Matrix UI:** Block 4 ("Madurez e intercoop técnica") was deeply enhanced with a custom interactive Traffic Light Matrix (Red/Yellow/Green) for self-evaluation.
4. **Contextual Tooltips:** Embedded definitions for all 10 maturity dimensions based directly on the agreements from the III Encuentro Coruña.
5. **Supabase Auto-Save:** The application is connected securely to your Supabase PostgreSQL database. Every time a user clicks "Siguiente", their answers are automatically saved to the cloud, preventing data loss.

## How to Test and Verify

Your application is currently running live on your machine!

*   **To Test the UI:** Open an Incognito window and visit `http://localhost:3000` to see the homepage and login screen.
*   **To Test the Form:** Visit `http://localhost:3000/form`. You can interact with the radio buttons, text fields, and the new Traffic Light Matrix in Block 4.
*   **To Test the Database:**
    *   Fill out a few questions on the form.
    *   Click "Siguiente →".
    *   Go to your Supabase Dashboard online, click "Table Editor" on the left, and click on `diagnostic_forms`. You will see your answers have magically appeared structured perfectly in JSON format!

## Next Steps
This application represents a massive step forward for the technical capacity of the GIASAT network.

Whenever you are ready to make this link public to the 16+ coordinators before the April 15th deadline, we will deploy it for free using **Vercel**. All it takes is one command! We can tackle that in our next session.
