"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { SiteHeader } from "@/components/SiteHeader";
import type { SiteContent } from "@/lib/site-content";
import { defaultContent, getContent, setContent } from "@/lib/site-content";

export default function ContentPage() {
  const router = useRouter();
  const [content, setContentState] = useState<SiteContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContentState(getContent());
  }, []);

  function updateHero(field: keyof SiteContent["hero"], lang: "zh" | "en", value: string) {
    setContentState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: typeof prev.hero[field] === "object" && prev.hero[field] !== null && "zh" in (prev.hero[field] as object)
          ? { ...(prev.hero[field] as { zh: string; en: string }), [lang]: value }
          : value,
      },
    }));
  }

  function updateHeroUrl(field: "ctaPrimaryUrl" | "ctaSecondaryUrl", value: string) {
    setContentState((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  }

  function updateAbout(field: keyof SiteContent["about"], value: string | string[]) {
    setContentState((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  }

  function updateAboutText(field: "title" | "description", lang: "zh" | "en", value: string) {
    setContentState((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: { ...(prev.about[field] as { zh: string; en: string }), [lang]: value },
      },
    }));
  }

  function updateBrand(value: string) {
    setContentState((prev) => ({
      ...prev,
      brand: { ...prev.brand, name: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      setContent(content);
      setSaved(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      alert("保存失败");
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm("确定要重置为默认内容吗？")) {
      setContentState(defaultContent);
      setContent(defaultContent);
    }
  }

  return (
    <main className="min-h-screen px-3 py-4 text-[var(--text-main)] md:px-6">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<div className="h-16" />}>
          <SiteHeader locale="zh" brand="内容管理" />
        </Suspense>

        <div className="mt-6 space-y-6">
          {/* 品牌名称 */}
          <section className="glass-panel rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">品牌名称</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">显示在网站头部的品牌名称</p>
            <input
              type="text"
              value={content.brand.name}
              onChange={(e) => updateBrand(e.target.value)}
              className="form-field mt-4 w-full text-sm"
              placeholder="品牌名称"
            />
          </section>

          {/* Hero 区域 */}
          <section className="glass-panel rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">Hero 区域</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">首页顶部的主要展示区域</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">问候语</label>
                <p className="text-xs text-[var(--text-soft)]">后面会自动添加名称，只需填写问候语即可</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <input
                      type="text"
                      value={content.hero.greeting.zh}
                      onChange={(e) => updateHero("greeting", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="你好，我是"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <input
                      type="text"
                      value={content.hero.greeting.en}
                      onChange={(e) => updateHero("greeting", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="Hi, I'm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">主标题</label>
                <p className="text-xs text-[var(--text-soft)]">支持换行，按回车键即可</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <textarea
                      value={content.hero.title.zh}
                      onChange={(e) => updateHero("title", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={2}
                      placeholder="中文标题"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <textarea
                      value={content.hero.title.en}
                      onChange={(e) => updateHero("title", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={2}
                      placeholder="英文标题"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">描述</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <textarea
                      value={content.hero.summary.zh}
                      onChange={(e) => updateHero("summary", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={3}
                      placeholder="中文描述"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <textarea
                      value={content.hero.summary.en}
                      onChange={(e) => updateHero("summary", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={3}
                      placeholder="英文描述"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">主按钮文字</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <input
                      type="text"
                      value={content.hero.ctaPrimary.zh}
                      onChange={(e) => updateHero("ctaPrimary", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="中文按钮文字"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <input
                      type="text"
                      value={content.hero.ctaPrimary.en}
                      onChange={(e) => updateHero("ctaPrimary", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="英文按钮文字"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">主按钮链接</label>
                <input
                  type="text"
                  value={content.hero.ctaPrimaryUrl}
                  onChange={(e) => updateHeroUrl("ctaPrimaryUrl", e.target.value)}
                  className="form-field mt-2 w-full text-sm"
                  placeholder="#projects 或 https://xxx.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">副按钮文字</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <input
                      type="text"
                      value={content.hero.ctaSecondary.zh}
                      onChange={(e) => updateHero("ctaSecondary", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="中文按钮文字"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <input
                      type="text"
                      value={content.hero.ctaSecondary.en}
                      onChange={(e) => updateHero("ctaSecondary", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="英文按钮文字"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">副按钮链接</label>
                <input
                  type="url"
                  value={content.hero.ctaSecondaryUrl}
                  onChange={(e) => updateHeroUrl("ctaSecondaryUrl", e.target.value)}
                  className="form-field mt-2 w-full text-sm"
                  placeholder="https://github.com/xxx"
                />
              </div>
            </div>
          </section>

          {/* 关于我区域 */}
          <section className="glass-panel rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">关于我区域</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">首页关于我模块的内容</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <input
                      type="text"
                      value={content.about.title.zh}
                      onChange={(e) => updateAboutText("title", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="中文标题"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <input
                      type="text"
                      value={content.about.title.en}
                      onChange={(e) => updateAboutText("title", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      placeholder="英文标题"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">描述</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">中文</span>
                    <textarea
                      value={content.about.description.zh}
                      onChange={(e) => updateAboutText("description", "zh", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={3}
                      placeholder="中文描述"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-soft)]">英文</span>
                    <textarea
                      value={content.about.description.en}
                      onChange={(e) => updateAboutText("description", "en", e.target.value)}
                      className="form-field mt-1 w-full text-sm"
                      rows={3}
                      placeholder="英文描述"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">技能标签</label>
                <p className="text-xs text-[var(--text-soft)]">用逗号分隔多个标签（支持中英文逗号）</p>
                <input
                  type="text"
                  value={content.about.skills.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const skills = value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
                    updateAbout("skills", skills);
                  }}
                  className="form-field mt-2 w-full text-sm"
                  placeholder="AI Coding, Frontend, Product, Deploy"
                />
              </div>

              <div>
                <label className="text-sm font-medium">头像图片</label>
                <ImageUpload
                  value={content.about.avatar}
                  onChange={(value) => updateAbout("avatar", value)}
                  aspectRatio="4:5"
                  recommendedSize="640x800"
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between rounded-[24px] bg-[var(--panel-soft)] p-4">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-[var(--line-muted)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              重置为默认
            </button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm text-green-500">已保存，跳转中...</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[var(--text-main)] px-6 py-2 text-sm font-medium text-[var(--page-bg)] transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存更改"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
