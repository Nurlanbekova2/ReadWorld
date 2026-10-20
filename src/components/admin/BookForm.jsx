import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useLang } from "../../i18n/index.jsx";
import { uploadBookCover } from "../../utils/uploadImage";
import { localizeBook } from "../../utils/localizeBook";
import { FiUploadCloud, FiX, FiStar, FiCheck } from "react-icons/fi";

const CATEGORY_KEYS = [
  "Fiction","Non-Fiction","Science","Technology","History","Biography",
  "Fantasy","Mystery","Romance","Comedy","Drama","Horror","Thriller",
  "Adventure","Psychology","Philosophy","Poetry","Other",
];

export default function BookForm({ defaultValues = {}, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues });
  const { lang, t } = useLang();
  const [imagePreview,    setImagePreview]    = useState(defaultValues.imageUrl || null);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploading,       setUploading]       = useState(false);
  const [uploadDone,      setUploadDone]      = useState(!!defaultValues.imageUrl);
  const [ratingVal,       setRatingVal]       = useState(Number(defaultValues.rating) || 0);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately — never blocks
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploading(true);
    setUploadDone(false);
    setUploadProgress(0);

    // Run upload in next tick so UI repaints first
    setTimeout(async () => {
      try {
        const url = await uploadBookCover(file, (pct) => setUploadProgress(pct));
        setValue("imageUrl", url);
        // For base64 keep local blob preview (it looks the same)
        if (url && !url.startsWith("data:")) setImagePreview(url);
        setUploadDone(true);
      } catch (err) {
        console.error("Image upload error:", err);
        // Keep local preview but mark as not uploaded
        setValue("imageUrl", localUrl); // use blob url as fallback
        setUploadDone(true);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }, 50);
  }

  function handleRating(val) {
    setRatingVal(val);
    setValue("rating", val);
  }

  function submit(data) {
    onSubmit({ ...data, rating: ratingVal });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cover upload ── */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            {t.bookForm.coverLabel}
          </label>
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className={"relative rounded-2xl border-2 border-dashed overflow-hidden transition " +
              (!uploading ? "cursor-pointer " : "cursor-wait ") +
              (imagePreview
                ? "border-primary-300 dark:border-primary-700"
                : "border-gray-200 dark:border-dark-border hover:border-primary-400")}
            style={{ aspectRatio: "3/4" }}>

            {/* Preview or placeholder */}
            {imagePreview ? (
              <>
                <img src={imagePreview} alt={t.bookForm.coverPreview} className="w-full h-full object-cover" />
                {!uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <p className="text-white text-sm font-medium">{t.bookForm.clickToChange}</p>
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setUploadDone(false);
                      setValue("imageUrl", "");
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white shadow z-10">
                    <FiX size={12} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <FiUploadCloud className="text-gray-300 dark:text-dark-border mb-3" size={40} />
                <p className="text-sm text-gray-500 dark:text-dark-muted">{t.bookForm.coverHint}</p>
                <p className="text-xs text-gray-400 mt-1">{t.bookForm.coverFormats}</p>
              </div>
            )}

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3 p-5">
                <div className="w-full bg-gray-600/80 rounded-full h-2.5">
                  <div
                    className="bg-primary-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: Math.max(uploadProgress, 5) + "%" }}
                  />
                </div>
                <p className="text-white text-sm font-semibold">
                  {uploadProgress > 0 ? uploadProgress + "%" : t.bookForm.uploadingProgress}
                </p>
              </div>
            )}

            {/* Done checkmark */}
            {uploadDone && !uploading && imagePreview && (
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow">
                <FiCheck size={12} className="text-white" />
              </div>
            )}
          </div>

          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
          <input type="hidden" {...register("imageUrl")} />

          {uploadDone && !uploading && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <FiCheck size={11} /> {t.bookForm.imageReady}
            </p>
          )}
        </div>

        {/* ── Fields ── */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.titleLabel} *</label>
            <input type="text" placeholder={t.bookForm.titlePlaceholder}
              className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text " +
                (errors.title ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
              {...register("title", { required: t.bookForm.errors.titleRequired })}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.authorLabel} *</label>
            <input type="text" placeholder={t.bookForm.authorPlaceholder}
              className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text " +
                (errors.author ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
              {...register("author", { required: t.bookForm.errors.authorRequired })}
            />
            {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author.message}</p>}
          </div>

          <details className="rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-dark-text">
              {t.bookForm.translationsTitle}
            </summary>
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-muted">
              {t.bookForm.translationsHint}
            </p>
            {["ru", "ky"].map((translationLanguage) => (
              <fieldset key={translationLanguage} className="mt-4 space-y-3">
                <legend className="mb-2 text-sm font-semibold text-primary-600">
                  {t.bookForm.languages[translationLanguage]}
                </legend>
                <input
                  type="text"
                  placeholder={t.bookForm.titleLabel}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  {...register(`translations.${translationLanguage}.title`)}
                />
                <input
                  type="text"
                  placeholder={t.bookForm.authorLabel}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  {...register(`translations.${translationLanguage}.author`)}
                />
                <textarea
                  rows={3}
                  placeholder={t.bookForm.descriptionLabel}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  {...register(`translations.${translationLanguage}.description`)}
                />
              </fieldset>
            ))}
          </details>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.categoryLabel} *</label>
              <select
                className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text " +
                  (errors.category ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
                {...register("category", { required: t.bookForm.errors.categoryRequired })}>
                <option value="">{t.bookForm.categoryPlaceholder}</option>
                {CATEGORY_KEYS.map((c) => (
                  <option key={c} value={c}>
                    {c === "Other"
                      ? t.bookForm.otherCategory
                      : localizeBook({ category: c }, lang, t).category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.priceLabel} *</label>
              <input type="number" step="0.01" min="0" placeholder={t.bookForm.pricePlaceholder}
                className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text " +
                  (errors.price ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
                {...register("price", { required: t.bookForm.errors.priceRequired, min: { value: 0, message: t.bookForm.errors.priceMin } })}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.ratingLabel}</label>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => handleRating(s)}>
                  <FiStar size={26}
                    className={s <= ratingVal ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                    style={{ fill: s <= ratingVal ? "currentColor" : "none" }} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-dark-muted">{ratingVal}/5</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.bookForm.descriptionLabel}</label>
            <textarea rows={5} placeholder={t.bookForm.descriptionPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              {...register("description")}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition font-medium text-sm">
          {t.cancel}
        </button>
        <button type="submit" disabled={loading || uploading}
          className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-sm disabled:opacity-60 text-sm">
          {loading ? t.bookForm.saving : uploading ? t.bookForm.uploading : t.bookForm.saveBook}
        </button>
      </div>
    </form>
  );
}
