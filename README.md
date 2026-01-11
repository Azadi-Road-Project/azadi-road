# Azadi Road | راه آزادی 🕊️

**Azadi Road** is an open-source digital memorial dedicated to those who lost their lives fighting for freedom in Iran. 

The goal of this project is to document the faces and stories of these souls through an interactive timeline, ensuring that we never forget the precious lives sacrificed on the path to liberty. We have built this space to ensure that their legacy remains etched in our collective memory forever.

هدف این پروژه مستندسازی چهره‌ها و داستان‌های این جان‌های شریف در یک تایم‌لاین تعاملی است تا برای همیشه در یاد و خاطرمان بماند که چه جان‌های عزیزی در راه رسیدن به آزادی فدا شدند. ما این فضا را بنا کردیم تا اطمینان حاصل کنیم که میراث آن‌ها هرگز فراموش نخواهد شد.

---

## ⚠️ Disclaimer | سلب مسئولیت

The information presented on **Azadi Road** is gathered from publicly available sources, including news agencies, Wikipedia, human rights organizations, and online social media reports. 

While we strive for accuracy, we cannot independently verify every detail. This project serves as a reflection of documented reports. We encourage users to refer to the linked sources for detailed investigations.

اطلاعات ارائه شده در **جاده آزادی** از منابع عمومی (خبرگزاری‌ها، ویکی‌پدیا، سازمان‌های حقوق بشری و گزارش‌های معتبر رسانه‌های اجتماعی) جمع‌آوری شده است. ما برای دقت اطلاعات تلاش می‌کنیم، اما نمی‌توانیم به طور مستقل صحت تمام جزئیات را تأیید کنیم. این سایت بازتابی از گزارش‌های منتشر شده در رسانه‌هاست.

---

## 🔍 Content Verification | راستی‌آزمایی محتوا

Some profiles are tagged with an **AI-Generated** badge. This means the initial data was collected using AI tools to speed up the documentation process and has not yet been manually cross-referenced with all sources. 

برخی از پروفایل‌ها با نشان **AI-Generated** مشخص شده‌اند. این بدان معناست که داده‌های اولیه با کمک ابزارهای هوش مصنوعی جمع‌آوری شده‌اند و هنوز به طور کامل بازبینی انسانی نشده‌اند.


## 🛠️ How to Contribute | نحوه مشارکت

We welcome contributions to keep this memorial accurate and complete. You can help by:
- **Adding new memorials:** If a name is missing from the timeline.
- **Correcting data:** If you find an error in dates, names, or locations.
- **Improving UI:** Helping with the code to make the experience better.

ما از مشارکت شما برای دقیق‌تر و کامل‌تر کردن این یادبود استقبال می‌کنیم. شما می‌توانید به روش‌های زیر کمک کنید:
- **افزودن یادبودهای جدید:** اگر نامی در تایم‌لاین خالی است.
- **تصحیح اطلاعات:** اگر خطایی در تاریخ‌ها، نام‌ها یا مکان‌ها مشاهده کردید.
- **بهبود رابط کاربری:** کمک به کدهای پروژه برای ایجاد تجربه‌ای بهتر.

---

### 📸 Important Note on Images | نکته مهم در مورد تصاویر

To maintain visual quality and security, **contributors should only modify text data.** If you have a photo, please include a link to it in your Pull Request or open an Issue. The owner will process, optimize, and add it manually.

به منظور حفظ کیفیت بصری و امنیت پروژه، **مشارکت‌کنندگان عزیز فقط مجاز به تغییر داده‌های متنی هستند.** اگر تصویری از قهرمانی در اختیار دارید، لطفاً لینک آن را در PR (مرج ریکوئست) خود قرار دهید یا یک Issue باز کنید. مدیر پروژه تصویر را پس از بهینه‌سازی (سیاه و سفید و کم‌حجم کردن) به سایت اضافه خواهد کرد.

---

## 📂 Project Structure | ساختار پروژه

```
azadi-road/
├── public/
│   └── images/
│       └── memorials/          # Hero profile images
├── src/
│   ├── components/          # React components
│   ├── data/
│   │   └── memorials.js        # Main data file - ADD NEW MEMORIALS HERE
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
```

---

## 📝 Data Format | فرمت داده‌ها

Each entry in `src/data/memorials.js` follows this structure:

```javascript
{
  "id": "unique-identifier",           // الزامی - Required: kebab-case (e.g. jina-amini)
  "name": "Full Name",                 // الزامی - Required
  "sex": "male" | "female" | "nb",     // الزامی - Required
  "age": "YY",                         // اختیاری - Optional
  "causeOfDeath": "Brief description", // الزامی - Required
  "description": "Detailed story",     // اختیاری - Optional
  "born_at": "YYYY-MM-DD",             // اختیاری - Optional
  "died_at": "YYYY-MM-DD",             // الزامی - Required
  "city": "City Name",                 // اختیاری - Optional
  "province": "Province Name",         // اختیاری - Optional
  "links": ["source-url-1", "..."]     // الزامی - Required (Credible sources)
}
```
**Note:** The `id` field must be unique and in lowercase kebab-case format (e.g., `neda-agha-soltan`).


---

## 🔍 Data Validation | اعتبارسنجی داده‌ها

Before submitting a Pull Request:
1. Ensure all required fields are filled
2. Verify ID uniqueness and correct format
3. Include at least one credible source link
4. Run validation (if available): `npm test`

برای جلوگیری از خطا:
۱. همه فیلدهای الزامی را پر کنید
۲. یکتا بودن ID و فرمت صحیح آن را بررسی کنید
۳. حداقل یک منبع معتبر ارائه دهید
۴. در صورت وجود، تست اعتبارسنجی را اجرا کنید

---

## 💻 Development | توسعه

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
