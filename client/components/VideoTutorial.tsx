export function VideoTutorial() {
  return (
    <section className="mt-16 border-t pt-12 pb-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          نحوه نوشتن متن برای ویدیو
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Motion Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-brand-primary">
                🎬 فقط حرکت رو بگو
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                تصویرت که قبلاً داری، هیچ نیازی نیست لباس یا رنگو توضیح بدی. فقط بگو چی می‌خوای حرکت کنه:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  ❌ "مردی با موهای سیاه و کت آبی دست برای دستان‌دادن دراز می‌کند"
                </em>
                <em className="block mt-2 p-2 bg-muted rounded">
                  ✅ "دست دراز می‌کند برای دستان‌دادن"
                </em>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-brand-secondary">
                📹 دوربین کجا برو
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                بگو دوربین چطور حرکت کنه (نزدیک شدن، چرخش، سمت و سو):
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "دوربین آهسته نزدیک می‌شه تا صورت رو ببینیم"
                </em>
              </p>
            </div>
          </div>

          {/* Advanced Techniques */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-brand-accent">
                ✨ چند حرکت با هم
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                می‌تونی چند چیز رو باهم حرکت بدی تا بهتر شد:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "موها واژنده، دوربین نزدیک می‌شه، نور طلایی ریخته میشه"
                </em>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                🎞️ حس و فضای ویدیو
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                بگو ویدیو چه احساسی داشته باشه:
                <br />
                <em className="block mt-2 p-2 bg-muted rounded">
                  "آرام و رومانتیک"، "پرانرژی"، "سینمایی و درام‌دار"
                </em>
              </p>
            </div>
          </div>
        </div>

        {/* Core Elements */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8 dark:bg-blue-950/30 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4">🎯 اجزای اصلی پرامپت ویدیو</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۱. حرکت موضوع (Subject Motion)</p>
              <p className="text-muted-foreground">سوژه چگونه حرکت می‌کند: دقیق و مشخص بنویسید</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"فرد آهسته سر را می‌چرخاند"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۲. حرکت دوربین (Camera Motion)</p>
              <p className="text-muted-foreground">دوربین کجا حرکت می‌کند: تنها ۱-۲ حرکت</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"دوربین کند‌رو به جلو حرکت می‌کند"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۳. روشنایی (Lighting)</p>
              <p className="text-muted-foreground">روشنایی احساس و تم را تعیین می‌کند</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"نور نرم، روشنایی طلایی از پنجره"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۴. حالت و فضا (Mood & Atmosphere)</p>
              <p className="text-muted-foreground">احساس عمومی ویدیو را توضیح دهید</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"سینمایی، آرام، رمزآلود"</p>
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="p-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg border border-brand-primary/20">
          <h3 className="font-semibold mb-4">💡 نکات مهم برای نتایج بهتر:</h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>فقط حرکت را توضیح دهید:</strong> تصویر قبلاً رنگ، لباس و محیط را دارد</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>ساده و مختصر:</strong> پیچیدگی زیادی باعث نتایج ضعیف می‌شود</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>حرکت طبیعی:</strong> از حرکات فیزیکی واقعی استفاده کنید</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>محدود کردن حرکات:</strong> بیش از ۲ حرکت دوربین مختلف استفاده نکنید</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>حذف نفی:</strong> به جای "بدون حرکت دوربین" از "دوربین ثابت" استفاده کنید</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>کثافت حرکت:</strong> کلمات مانند "ملایم"، "آهسته"، "ظریف" برای حرکت دقیق استفاده کنید</span>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-center">📚 نمونه‌های عملی</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Good Example */}
            <div className="p-4 border-2 border-green-500/30 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ مثال خوب:</p>
              <p className="text-sm text-muted-foreground italic">
                "فرد آهسته سر را به سمت چپ می‌چرخاند. دوربین از راست به چپ حرکت می‌کند. موی‌ها با ملایمت جریان می‌یابند."
              </p>
            </div>

            {/* Bad Example */}
            <div className="p-4 border-2 border-red-500/30 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ مثال ضعیف:</p>
              <p className="text-sm text-muted-foreground italic">
                "فرد با موهای سیاه و لباس آبی سر را به سمت چپ می‌چرخاند، دوربین ۳۶۰ درجه می‌چرخد، بزرگ‌نمایی می‌کند و پایین می‌رود"
              </p>
            </div>

            {/* Product Example */}
            <div className="p-4 border-2 border-blue-500/30 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">🛍️ مثال کالا:</p>
              <p className="text-sm text-muted-foreground italic">
                "دوربین آهسته محصول را دور می‌زند. نور نرم جزئیات را برجسته می‌کند. محصول در سینمایی و حرفه‌ای به نظر می‌رسد."
              </p>
            </div>

            {/* Portrait Example */}
            <div className="p-4 border-2 border-purple-500/30 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <p className="font-semibold text-purple-700 dark:text-purple-400 mb-2">🎭 مثال پرتره:</p>
              <p className="text-sm text-muted-foreground italic">
                "فرد به آهستگی نگاه خود را تغییر می‌دهد. دوربین با آهستگی بزرگ‌نمایی می‌کند. روشنایی طلایی از پشت."
              </p>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-8 p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">⚠️ نکته مهم:</p>
          <p className="text-sm text-muted-foreground">
            هدف نوشتن پرامپت بهتر برای ویدیو این است که تنها <strong>حرکت و دید دوربین</strong> را توصیف کنید. تصویر شما قبلاً تمام جزئیات بصری (رنگ، لباس، محیط) را دارد. بیش از توصیف این موارد، بر روی حرکت تمرکز کنید.
          </p>
        </div>
      </div>
    </section>
  );
}
