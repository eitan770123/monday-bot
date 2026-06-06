const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// מפת הצבעים (1-3 המוגדרים, 4-8 אקראיים, 9 הפתעה)
const COLOR_MAP = {
    '1': '#ffeb3b',    // 1. צהוב
    '2': '#ff0000',    // 2. אדום
    '3': '#0000ff',    // 3. כחול
    '4': '#00ff00',    // 4. ירוק זוהר
    '5': '#ff00ff',    // 5. ורוד / מג'נטה
    '6': '#00ffff',    // 6. תכלת / ציאן
    '7': '#ff9800',    // 7. כתום
    '8': '#7e57c2',    // 8. סגול עמוק
    '9': 'surprise'    // 9. תפתיע אותי!
};

// פונקציה סודית שמייצרת טוקן אנונימי חדש וטרי מול Firebase של מאנדיי
async function getFreshToken() {
    try {
        // פנייה ישירה לשרתי גוגל Firebase שמשרתים את האתר mondaysign
        const response = await axios.post(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAs7vG46-xH_S5V2M7g1wX6lq8N_YI7Z84', 
            { returnSecureToken: true }
        );
        return response.data.idToken; // מחזיר טוקן חדש לחלוטין בתוקף לשעה קרובה
    } catch (error) {
        console.error("Failed to generate fresh token:", error.message);
        throw new Error("Token generation failed");
    }
}

app.get('/change-color', async (req, res) => {
    const selection = req.query.Selection;
    const targetColor = COLOR_MAP[selection];

    if (!targetColor) {
        return res.send("id_list_message=t-מקש שגוי. אנא לחצו על מקש בין 1 ל 9&go_to_folder=/1");
    }

    try {
        // 1. השגת טוקן חדש ורענן אוטומטית עבור השיחה הנוכחית!
        const freshToken = await getFreshToken();

        // 2. שליחת הפקודה האמיתית לאתר של מאנדיי עם הטוקן החדש
        await axios.post('https://mondaysign.com/api/sendSmartSignCommand', 
            { color: targetColor }, 
            {
                headers: {
                    'Authorization': `Bearer ${freshToken}`, // שימוש בטוקן החדש
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                    'Origin': 'https://mondaysign.com',
                    'Referer': 'https://mondaysign.com/'
                }
            }
        );

        let successMessage = selection === '9' ? "פקודת הפתעה נשלחה בהצלחה" : "הצבע בשלט שונה בהצלחה";
        return res.send(`id_list_message=t-${successMessage}&hangup=yes`);

    } catch (error) {
        console.error("Error running command:", error.response ? error.response.data : error.message);
        return res.send("id_list_message=t-חלה תקלה בתקשורת עם השלט. אנא נסו שנית מאוחר יותר&hangup=yes");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));