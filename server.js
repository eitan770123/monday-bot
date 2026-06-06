const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// מפת הצבעים לפי הסדר המדויק שביקשת (1-3 המוגדרים, 4-8 אקראיים יפים, 9 הפתעה)
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

app.get('/change-color', async (req, res) => {
    const selection = req.query.Selection;
    const targetColor = COLOR_MAP[selection];

    if (!targetColor) {
        return res.send("id_list_message=t-מקש שגוי. אנא לחצו על מקש בין 1 ל 9&go_to_folder=/1");
    }

    // הטוקן המקורי והחזק שתפסת בעצמך מהאתר
    const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc5OTRiNGYzMTU2MzJiMjk3NzAwNmQ5M2U5NGIyYWNiZTMwNWZlNDYiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9tYWtlcnMtcHJvZCIsImF1ZCI6Im1ha2Vycy1wcm9kIiwiYXV0aF90aW1lIjoxNzgwNTc3OTg4LCJ1c2VyX2lkIjoidkhyU0Jjd09ob1FodXdWMmZ5dTRrQUd5cnNtMSIsInN1YiI6InZIclNCY3dPaG9RaHV3VjJmeXU0a0FHeXJzbTEiLCJpYXQiOjE3ODA1Nzc5ODgsImV4cCI6MTc4MDU4MTU4OCwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.Ii-yTb5uX4StCXfVKZVtqsxqk2D85cAsVq89xuHOLiKMU2hQpAbwwLLirgPSZP2Dt56dwZqd79PRPOoMi_-7tsKsToHMrYUhsvxcSOoA755U_crBLIYO-xMqvLfd2VDw85aj6pvUfq--s-UlOTvmrkJztjJ52yEMj0HrKZueK5ZRtDfJZmf25s0b05LnFsViUD1DSz6mMHgBTR27HNSNjnUVj7te_VPXd2ETLRVoKd-hkpuz4vkD5hia4RlY9PaVJ-A55w2zrrZZaRxLp9xZV3TW6hhYMLlqf6jWFQEWYCQclZELUdv536ViyDMvKPYeCW4G23ElILDd7ZQ74ou5og";

    try {
        // שליחת הפקודה ישירות ל-API של מאנדיי עם הטוקן שלך
        await axios.post('https://mondaysign.com/api/sendSmartSignCommand', 
            { color: targetColor }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
