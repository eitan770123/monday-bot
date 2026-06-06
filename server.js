const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

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

// פונקציה שמייצרת סשן אנונימי חדש מול האתר של מאנדיי ומקבלת טוקן טרי
async function getMondaysignToken() {
    try {
        const response = await axios.post('https://mondaysign.com/api/getAnonymousUserToken', {}, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'Origin': 'https://mondaysign.com',
                'Referer': 'https://mondaysign.com/'
            }
        });
        
        // שליפת הטוקן מתוך תגובת השרת שלהם
        if (response.data && response.data.token) {
            return response.data.token;
        }
        throw new Error("Token not found in response");
    } catch (error) {
        console.error("Failed to fetch token from mondaysign:", error.message);
        throw error;
    }
}

app.get('/change-color', async (req, res) => {
    const selection = req.query.Selection;
    const targetColor = COLOR_MAP[selection];

    if (!targetColor) {
        return res.send("id_list_message=t-מקש שגוי. אנא לחצו על מקש בין 1 ל 9&go_to_folder=/1");
    }

    try {
        // משיגים טוקן טרי לחלוטין עבור הפעולה הנוכחית
        const freshToken = await getMondaysignToken();

        // שליחת הפקודה האמיתית לשלט
        await axios.post('https://mondaysign.com/api/sendSmartSignCommand', 
            { color: targetColor }, 
            {
                headers: {
                    'Authorization': `Bearer ${freshToken}`,
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
