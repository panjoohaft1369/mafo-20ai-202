export function Tutorial() {
  return (
    <section className="mt-16 border-t pt-12 pb-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          آموزش نوشتن پرامپت حرفه‌ای
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Instructions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                🎨 نحوه شرح دادن رنگ و ظاهر
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                برای مثال اگر مبلی می‌فروشید و می‌خواهید آن را با رنگ قرمز نشان دهید، بنویسید:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "یک مبل قرمز رنگ مدرن در اتاق نشیمن، روشنایی گرم، کیفیت بالا"
                </em>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                📍 تعیین موقعیت و محیط
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                محل قرار گرفتن محصول را مشخص کنید:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "مبل آبی در اتاق خوشمنظره خانه با پنجره‌های بزرگ و نور طبیعی"
                </em>
              </p>
            </div>
          </div>

          {/* Advanced Instructions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                ✏️ جزئیات مهم
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                هر چه جزئیات بیشتر باشد، نتیجه بهتر است:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "مبل گلبهی روشن، طرح‌ مدرن، بافت فرفری، در اتاق مدرن با فرش خاکستری"
                </em>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                🖼️ اپلود و ترکیب تصویر
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ابتدا تصویر اتاق یا محصول را بارگذاری کنید، سپس توضیح دهید چه تغییری می‌خواهید:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "این تصویر از اتاق من است، مبل قرمز بزرگ در کنار پنجره بگذار"
                </em>
              </p>
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-4">💡 نکات مهم برای بهترین نتایج:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ پرامپت خود را به فارسی یا انگلیسی بنویسید</li>
            <li>✓ تا حد امکان جزئیات زیادی بیفزایید</li>
            <li>✓ رنگ‌ها، متریال‌ها و محیط را مشخص کنید</li>
            <li>✓ تصویری واضح و روشن برای نقطه شروع انتخاب کنید</li>
            <li>✓ اگر نتیجه را دوست ندارید، پرامپت را اصلاح کنید</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
