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
          <h3 className="text-lg font-semibold mb-4">🎯 چند نکته مهم</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۱. حرکت اشخاص و اشیا</p>
              <p className="text-muted-foreground">چطور سوژه می‌خوای حرکت کنه. مثلاً:
              </p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"سر رو آهسته می‌چرخونه" یا "لبخند می‌زنه"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۲. دوربین</p>
              <p className="text-muted-foreground">دوربین چطور حرکت کنه (۱ یا ۲ حرکت بس)</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"نزدیک میشه" یا "دور میره چپ و راست"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۳. نور</p>
              <p className="text-muted-foreground">نور چطور باشه (گرم، سرد، مات، براق)</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"نور نرم طلایی"</p>
            </div>

            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">۴. حس عمومی</p>
              <p className="text-muted-foreground">ویدیو چی حس بدی داشته باشه</p>
              <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">"رومانتیک و آرام" یا "انرژیک و حرارتی"</p>
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="p-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg border border-brand-primary/20">
          <h3 className="font-semibold mb-4">💡 نکاتی که نتیجه رو بهتر می‌کنه:</h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>فقط حرکت:</strong> تصویرت داره، نیازی نیست دوباره لباس و محیط توضیح بدی</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>کوتاه و سادی:</strong> بیش از حد طولانی نوشتن، عکس العمل عکس داره</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>حرکت های واقعی:</strong> چیزایی که تو زندگی واقعی ممکنه، نه خیالی</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>یک دو حرکت دوربین:</strong> بیش از اون خراب میشه</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>نه برای نفی:</strong> نگو "بدون حرکت"، بگو "ثابت می‌مونه"</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <span><strong>سرعت رو مشخص کن:</strong> "آهسته"، "سریع"، "ملایم" تفاوت داره</span>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-center">📚 نمونه‌ها</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Good Example */}
            <div className="p-4 border-2 border-green-500/30 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ خوب:</p>
              <p className="text-sm text-muted-foreground italic">
                "آهسته سر میچرخونه، دوربین نزدیک میشه، موها واژنده"
              </p>
            </div>

            {/* Bad Example */}
            <div className="p-4 border-2 border-red-500/30 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ بد:</p>
              <p className="text-sm text-muted-foreground italic">
                "مردی با موهای سیاه و کت آبی، دوربین دور میزنه، بزرگ نمایی میشه، دور میچرخه، بالا میره"
              </p>
            </div>

            {/* Product Example */}
            <div className="p-4 border-2 border-blue-500/30 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">🛍️ برای محصول:</p>
              <p className="text-sm text-muted-foreground italic">
                "دوربین دور و دور محصول میچرخه آهسته، نور نرم، جزئیات رو خوب می‌بینی"
              </p>
            </div>

            {/* Portrait Example */}
            <div className="p-4 border-2 border-purple-500/30 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <p className="font-semibold text-purple-700 dark:text-purple-400 mb-2">🎭 برای چهره:</p>
              <p className="text-sm text-muted-foreground italic">
                "نگاه عوض میشه، دوربین نزدیک میشه، نور طلایی از پشت"
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
