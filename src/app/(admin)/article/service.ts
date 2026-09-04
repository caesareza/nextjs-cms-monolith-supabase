// app/(admin)/article/service.ts
import { createClient } from "@/utils/supabase/client";
import {
  ArticleComment,
  CreateCommentPayload,
  ReplyCommentPayload,
} from "@/types/article";

export const ArticleService = {
  // Read records using pagination, search filters, and full taxonomy joins
  async getArticles(params: {
    year: number;
    month: number;
    page: number;
    writerId?: string | null;
    categoryId?: string | null;
    productPriorityId?: string | null;
    contentType: string | null;
    searchQuery: string | null;
    status?: string;
    approval?: string | null;
  }) {
    const {
      year,
      month,
      page = 1,
      writerId,
      categoryId,
      productPriorityId,
      contentType,
      searchQuery,
      status,
      approval,
    } = params;
    const supabase = createClient();
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    // Updated Selection parameters to match all corporate taxonomy relationships
    let query = supabase
      .from("article")
      .select(
        `
                id,
                title,
                job_code,
                content,
                demand,
                intent,
                type,
                classification,
                status,
                approval,
                target_keyword,
                related_keyword,
                meta_description,
                cta_internal_link,
                gdrive_draft_content,
                created_at,
                content_approved_by_name,
                content_approved_by_email,
                content_approved_at,
                content_approval_notes,
                section:section_id(id, name),
                category:category_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                persona:persona_id(id, name),
                campaign:campaign_id(id, name),
                theme:theme_id(id, name),
                product_priority:product_priority_id(id, name)
            `,
        { count: "exact" },
      )
      .gte("production_month", startDate)
      .lt("production_month", endDate)
      .is("deleted_at", null);

    // Dynamic Filters
    if (writerId) query = query.eq("writer_id", writerId);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (productPriorityId)
      query = query.eq("product_priority_id", productPriorityId);
    if (contentType) query = query.eq("content_type", contentType);
    if (status) query = query.eq("status", status);
    if (approval) query = query.eq("approval", approval);

    // Search criteria matching input values
    if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

    const { data, error, count } = await query
      .order("id", { ascending: false }) // Enforced strict sorting constraint
      .range(from, to);

    if (error) throw error;

    return {
      articles: (data || []).map((item) => {
        const categoryObj = Array.isArray(item.category)
          ? item.category[0]
          : item.category;
        const sectionObj = Array.isArray(item.section)
          ? item.section[0]
          : item.section;
        const writerObj = Array.isArray(item.writer)
          ? item.writer[0]
          : item.writer;
        const productObj = Array.isArray(item.product)
          ? item.product[0]
          : item.product;
        const personaObj = Array.isArray(item.persona)
          ? item.persona[0]
          : item.persona;
        const campaignObj = Array.isArray(item.campaign)
          ? item.campaign[0]
          : item.campaign;
        const themeObj = Array.isArray(item.theme) ? item.theme[0] : item.theme;
        const productPriorityObj = Array.isArray(item.product_priority)
          ? item.product_priority[0]
          : item.product_priority;

        return {
          id: String(item.id),
          title: item.title,
          job_code: item.job_code,
          category: categoryObj?.name || "Uncategorized",
          writer: writerObj?.name || "Unknown",
          section: sectionObj?.name || "General",
          target_keyword: item.target_keyword,
          related_keyword: item.related_keyword || "",

          product: String(productObj?.id || ""),
          product_name: productObj?.name || "Umum",
          product_priority: productPriorityObj?.name || "General",
          product_priority_id: productPriorityObj?.id || null,

          persona: personaObj?.name || "All Target Profiles",
          campaign: campaignObj?.name || "Organic / None",
          theme: themeObj?.name || "General Topic",

          demand: item.demand || 0,
          intent: item.intent,
          type: item.type,
          classification: item.classification,

          isApproved: item.approval === "approved",
          approval: item.approval,
          status: item.status,
          created_at: item.created_at,
          gdrive_draft_content: item.gdrive_draft_content,
          meta_description: item.meta_description,
          cta_internal_link: item.cta_internal_link,
          content_approved_by_name: item.content_approved_by_name,
          content_approved_by_email: item.content_approved_by_email,
          content_approved_at: item.content_approved_at,
          content_approval_notes: item.content_approval_notes,
        };
      }),
      total: count || 0,
    };
  },

  async getArticleById(id: number) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article")
      .select(`
                *,
                category:category_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                persona:persona_id(id, name),
                campaign:campaign_id(id, name),
                theme:theme_id(id, name),
                product_priority:product_priority_id(id, name)
            `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getWorkflowLogs(articleId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("workflow_logs")
      .select("*")
      .eq("article_id", Number(articleId))
      .order("id", { ascending: false }); // ID descending rule consistency

    if (error) throw error;
    return data || [];
  },

  async getTopPending(limit = 10) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article")
      .select(`
                id, 
                title, 
                job_code,
                created_at, 
                approval,
                demand,
                intent,
                classification,
                target_keyword,
                related_keyword,
                meta_description,
                status,
                category:category_id(id, name),
                section:section_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                product_priority:product_priority_id(id, name, code)
            `)
      .eq("approval", "pending")
      .order("id", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async createArticle(payload: {
    title: string;
    job_code: string;
    content: string;
    category_id: number;
    section_id: number;
    product_id: number;
    production_month: string;
    content_type: "new" | "adjust";
    demand: number;
    intent: string;
    type: string;
    classification: string; // Added to mandatory payload
    theme_id?: number | null;
    persona_id?: number | null;
    campaign_id?: number | null;
    product_priority_id?: number | null;
    content_old?: string;
    meta_description?: string;
    target_keyword?: string;
    related_keyword?: string;
    cta_internal_link?: string;
    gdrive_draft_content?: string;
    seo_check?: string;
    index_status?: string;
    internal_notes?: string;
    status: string;
  }) {
    const supabase = createClient();
    console.log("createArticle payload:", payload);

    const { data, error } = await supabase
      .from("article")
      .insert([
        {
          ...payload,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMarketingAssets(articleId: number) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("article_marketing_asset")
      .select("id, asset_type, asset_value")
      .eq("article_id", articleId)
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createMarketingAsset(payload: {
    article_id: number;
    asset_type: "product" | "cta";
    asset_value: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("article_marketing_asset")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWriters() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("writer")
      .select("id, name")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category")
      .select("id, name")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateArticle(
    id: number | string,
    payload: {
      title?: string;
      job_code?: string;
      content?: string;
      writer_id?: number;
      category_id?: number;
      section_id?: number;
      product_id?: number;
      production_month?: string;
      content_type?: "new" | "adjust";
      demand?: number;
      intent?: string;
      type?: string;
      classification?: string;
      theme_id?: number | null;
      persona_id?: number | null;
      campaign_id?: number | null;
      product_priority_id?: number | null;
      status?: string;
      target_keyword?: string;
      related_keyword?: string;
      meta_description?: string;
      cta_internal_link?: string;
      gdrive_draft_content?: string;
      approval?: string;
    },
  ) {
    const supabase = createClient();

    // 1. Fetch current status, approval, and content before saving the update
    const { data: oldArticle } = await supabase
      .from("article")
      .select("status, approval, content")
      .eq("id", id)
      .single();

    // 2. Perform the update
    const { data, error } = await supabase
      .from("article")
      .update({
        ...payload,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // 3. Log user action in database logs
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email || null;

      const isContentChanged =
        oldArticle && oldArticle.content !== payload.content;

      await supabase.from("workflow_logs").insert({
        article_id: Number(id),
        user_email: userEmail,
        old_status: oldArticle?.status || null,
        new_status: payload.status || oldArticle?.status || null,
        old_approval: oldArticle?.approval || null,
        new_approval: payload.approval || oldArticle?.approval || null,
        notes: isContentChanged
          ? "Draft content body updated"
          : "Article metadata updated",
        content_backup: isContentChanged ? oldArticle.content : null,
      });
    } catch (logErr) {
      console.error("Failed to write update workflow log:", logErr);
    }

    return data;
  },

  async softDeleteArticle(
    id: number,
    currentStatus: string,
    userEmail: string,
  ) {
    const supabase = createClient();

    const { data: article, error: articleError } = await supabase
      .from("article")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (articleError) throw articleError;

    const { error: logError } = await supabase.from("workflow_logs").insert([
      {
        article_id: id,
        user_email: userEmail,
        old_status: currentStatus,
        new_status: "deleted",
        notes: "Article moved to trash (soft delete)",
      },
    ]);

    if (logError) throw logError;
    return article;
  },

  async updateWorkflow(params: {
    id: string;
    status: string;
    approval: "approved" | "rejected" | "pending" | string;
    url_published?: string;
    oldStatus: string;
    oldApproval: string;
    internal_notes?: string;
  }) {
    const {
      id,
      status,
      approval,
      url_published,
      oldStatus,
      oldApproval,
      internal_notes,
    } = params;
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userEmail = user?.email;

    let durationSeconds: number | null = null;
    let logNotes = url_published ? `Published to: ${url_published}` : null;

    if (approval === "approved") {
      try {
        // Query the article's created_at
        const { data: articleObj } = await supabase
          .from("article")
          .select("created_at")
          .eq("id", id)
          .single();

        let startTime = new Date(articleObj?.created_at || new Date());

        // Find the most recent log where new_approval === "pending" or new_status === "ready for review"
        const { data: logs } = await supabase
          .from("workflow_logs")
          .select("created_at")
          .eq("article_id", Number(id))
          .or("new_approval.eq.pending,new_status.eq.ready for review")
          .order("id", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          startTime = new Date(logs[0].created_at);
        }

        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        durationSeconds = Math.max(0, Math.floor(diffMs / 1000));

        const formatSeconds = (sec: number) => {
          const days = Math.floor(sec / (3600 * 24));
          const hours = Math.floor((sec % (3600 * 24)) / 3600);
          const minutes = Math.floor((sec % 3600) / 60);
          if (days > 0) return `${days}d ${hours}h ${minutes}m`;
          if (hours > 0) return `${hours}h ${minutes}m`;
          return `${minutes}m`;
        };

        logNotes = `Approved. Review took ${formatSeconds(durationSeconds)}`;
      } catch (durationErr) {
        console.error("Failed to calculate approval duration:", durationErr);
      }
    }

    if (approval === "rejected" && internal_notes) {
      logNotes = `Rejected by Director. Reason: ${internal_notes}`;
    }

    const updateData: any = {
      status,
      approval,
      approve_at: approval === "approved" ? new Date().toISOString() : null,
      approval_by: user?.email || null,
    };

    if (url_published) updateData.url_published = url_published;
    if (internal_notes) updateData.internal_notes = internal_notes;

    const updateDataWithDuration = { ...updateData };
    if (durationSeconds !== null) {
      updateDataWithDuration.approval_duration_seconds = durationSeconds;
    }

    const { error: updateError } = await supabase
      .from("article")
      .update(updateDataWithDuration)
      .eq("id", id);

    // Fallback in case approval_duration_seconds column migration hasn't run yet
    if (updateError) {
      console.warn(
        "Update with duration failed, retrying without duration column:",
        updateError,
      );
      const { error: retryError } = await supabase
        .from("article")
        .update(updateData)
        .eq("id", id);

      if (retryError) throw retryError;
    }

    await supabase.from("workflow_logs").insert({
      article_id: Number(id),
      user_email: userEmail,
      old_status: oldStatus,
      new_status: status,
      old_approval: oldApproval,
      new_approval: approval,
      notes: logNotes,
    });
  },

  async getArticleByShareToken(token: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article")
      .select(`
                *,
                category:category_id(id, name),
                writer:writer_id(id, name),
                product:product_id(id, name),
                persona:persona_id(id, name),
                campaign:campaign_id(id, name),
                theme:theme_id(id, name)
            `)
      .eq("share_token", token)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async regenerateShareToken(id: number | string) {
    const supabase = createClient();
    const newToken = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

    const { data, error } = await supabase
      .from("article")
      .update({ share_token: newToken })
      .eq("id", Number(id))
      .select("share_token")
      .single();

    if (error) throw error;
    return data.share_token;
  },

  async toggleShareActive(id: number | string, active: boolean) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article")
      .update({ share_active: active })
      .eq("id", Number(id))
      .select("share_active")
      .single();

    if (error) throw error;
    return data.share_active;
  },

  async submitExternalShareReview(payload: {
    token: string;
    action: "approve" | "revision";
    approverName: string;
    approverEmail: string;
    notes?: string;
  }) {
    const { token, action, approverName, approverEmail, notes } = payload;
    const supabase = createClient();

    // 1. Fetch current article by share_token
    const { data: article, error: fetchErr } = await supabase
      .from("article")
      .select("id, title, status, approval, share_active, created_at")
      .eq("share_token", token)
      .single();

    if (fetchErr || !article) {
      throw new Error("Invalid or expired preview token.");
    }

    if (!article.share_active) {
      throw new Error("Shared preview has been paused by the administrator.");
    }

    const reviewerTag = `${approverName.trim()} <${approverEmail.trim()}> (External Stakeholder)`;
    const nowIso = new Date().toISOString();

    if (action === "approve") {
      let durationSeconds: number | null = null;
      try {
        let startTime = new Date(article.created_at || new Date());
        const { data: logs } = await supabase
          .from("workflow_logs")
          .select("created_at")
          .eq("article_id", Number(article.id))
          .or("new_approval.eq.pending,new_status.eq.ready for review")
          .order("id", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          startTime = new Date(logs[0].created_at);
        }

        const diffMs = new Date().getTime() - startTime.getTime();
        durationSeconds = Math.max(0, Math.floor(diffMs / 1000));
      } catch (durationErr) {
        console.error("Failed to calculate approval duration:", durationErr);
      }

      const updateData: any = {
        status: "approved",
        content_approved_by_name: approverName.trim(),
        content_approved_by_email: approverEmail.trim(),
        content_approved_at: nowIso,
        content_approval_notes: notes?.trim() || null,
      };

      if (durationSeconds !== null) {
        updateData.approval_duration_seconds = durationSeconds;
      }

      let updated;
      const { data, error: updateErr } = await supabase
        .from("article")
        .update(updateData)
        .eq("id", article.id)
        .select()
        .single();

      if (updateErr) {
        // Fallback in case approval_duration_seconds column is missing in DB
        delete updateData.approval_duration_seconds;
        const { data: retryData, error: retryErr } = await supabase
          .from("article")
          .update(updateData)
          .eq("id", article.id)
          .select()
          .single();

        if (retryErr) throw retryErr;
        updated = retryData;
      } else {
        updated = data;
      }

      // Insert workflow log
      await supabase.from("workflow_logs").insert({
        article_id: Number(article.id),
        user_email: approverEmail.trim(),
        old_status: article.status,
        new_status: "approved",
        old_approval: article.approval,
        new_approval: article.approval,
        notes: notes?.trim()
          ? `Content approved by ${reviewerTag}. Note: ${notes.trim()}`
          : `Content approved by ${reviewerTag}`,
      });

      return updated;
    } else {
      // action === "revision"
      const { data: updated, error: updateErr } = await supabase
        .from("article")
        .update({
          status: "writing",
          internal_notes: notes?.trim() || "Revision requested by external reviewer",
        })
        .eq("id", article.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Insert workflow log
      await supabase.from("workflow_logs").insert({
        article_id: Number(article.id),
        user_email: approverEmail.trim(),
        old_status: article.status,
        new_status: "writing",
        old_approval: article.approval,
        new_approval: article.approval,
        notes: `Revisions requested by ${reviewerTag}. Remarks: ${notes?.trim() || "None specified"}`,
      });

      return updated;
    }
  },

  // ==========================================
  // EDITORIAL COMMENTS SYSTEM
  // ==========================================

  async getArticleComments(
    articleId: number | string,
  ): Promise<ArticleComment[]> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("article_comment")
        .select("*")
        .eq("article_id", Number(articleId))
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Failed to fetch article comments:", error.message);
        return [];
      }

      // Reconstruct threaded hierarchy
      const roots: ArticleComment[] = [];
      const map = new Map<number, ArticleComment>();

      (data || []).forEach((c: any) => {
        map.set(c.id, { ...c, replies: [] });
      });

      (data || []).forEach((c: any) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(map.get(c.id)!);
        } else if (!c.parent_id) {
          roots.push(map.get(c.id)!);
        }
      });

      return roots;
    } catch (err) {
      console.warn("Error in getArticleComments:", err);
      return [];
    }
  },

  async createArticleComment(
    payload: CreateCommentPayload,
  ): Promise<ArticleComment> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article_comment")
      .insert({
        article_id: payload.article_id,
        block_index:
          payload.block_index !== undefined ? payload.block_index : null,
        selected_text: payload.selected_text || null,
        content: payload.content,
        user_email: payload.user_email,
        user_name: payload.user_name || payload.user_email.split("@")[0],
        is_resolved: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return { ...data, replies: [] };
  },

  async replyArticleComment(
    payload: ReplyCommentPayload,
  ): Promise<ArticleComment> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article_comment")
      .insert({
        article_id: payload.article_id,
        parent_id: payload.parent_id,
        content: payload.content,
        user_email: payload.user_email,
        user_name: payload.user_name || payload.user_email.split("@")[0],
        is_resolved: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async toggleResolveComment(
    commentId: number,
    isResolved: boolean,
    userEmail: string,
  ): Promise<ArticleComment> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("article_comment")
      .update({
        is_resolved: isResolved,
        resolved_by: isResolved ? userEmail : null,
        resolved_at: isResolved ? new Date().toISOString() : null,
      })
      .eq("id", commentId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async deleteArticleComment(commentId: number): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from("article_comment")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return true;
  },
};
