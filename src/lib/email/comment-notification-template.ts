function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

interface CommentEmailProps {
  type: "comment" | "reply";

  articleTitle: string;
  articleDescription?: string;
  articleThumbnail?: string;
  articleUrl: string;

  senderName: string;
  messageText: string;

  originalComment?: string;
}

export function createCommentNotificationEmail({
  type,
  articleTitle,
  articleDescription,
  articleThumbnail,
  articleUrl,
  senderName,
  messageText,
  originalComment,
}: CommentEmailProps) {
  const isReply = type === "reply";

  const title = escapeHtml(
    truncate(articleTitle || "INFINIA BHARAT NEWS", 180)
  );

  const description = escapeHtml(
    truncate(articleDescription || "", 220)
  );

  const sender = escapeHtml(
    senderName || "Reader"
  );

  const message = escapeHtml(messageText);

  const original = escapeHtml(
    originalComment || ""
  );

  const safeArticleUrl = escapeHtml(articleUrl);

  const subjectTitle = truncate(
    articleTitle || "INFINIA BHARAT NEWS",
    75
  );

  const subject = isReply
    ? `New Reply • ${subjectTitle}`
    : `New Comment • ${subjectTitle}`;

  const previewText = isReply
    ? `${senderName || "Someone"} replied to your comment`
    : `${senderName || "A reader"} left a new comment`;

  const badge = isReply
    ? "NEW REPLY"
    : "NEW COMMENT";

  const heading = isReply
    ? "Someone replied to your comment"
    : "A reader left a new comment";

  const messageLabel = isReply
    ? `REPLY FROM ${sender}`
    : `COMMENT BY ${sender}`;

  const originalBlock = isReply && originalComment
    ? `
      <tr>
        <td style="padding:0 0 14px 0;">
          <div style="
            border:1px solid #E5E7EB;
            background:#F9FAFB;
            border-radius:12px;
            padding:16px 18px;
          ">
            <div style="
              font-family:Arial,Helvetica,sans-serif;
              font-size:11px;
              line-height:16px;
              font-weight:700;
              letter-spacing:.08em;
              color:#6B7280;
              text-transform:uppercase;
              margin-bottom:8px;
            ">
              YOUR COMMENT
            </div>

            <div style="
              font-family:Arial,Helvetica,sans-serif;
              font-size:14px;
              line-height:22px;
              color:#374151;
            ">
              ${original}
            </div>
          </div>
        </td>
      </tr>
    `
    : "";

  const imageBlock = articleThumbnail
    ? `
      <tr>
        <td style="padding:0;">
          <a
            href="${safeArticleUrl}"
            target="_blank"
            style="text-decoration:none;"
          >
            <img
              src="${escapeHtml(articleThumbnail)}"
              alt="${title}"
              width="640"
              style="
                display:block;
                width:100%;
                max-width:640px;
                height:auto;
                border:0;
                border-radius:14px;
              "
            />
          </a>
        </td>
      </tr>

      <tr>
        <td style="height:24px;font-size:0;line-height:0;">
          &nbsp;
        </td>
      </tr>
    `
    : "";

  const descriptionBlock = articleDescription
    ? `
      <div style="
        margin-top:9px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:13px;
        line-height:20px;
        color:#6B7280;
      ">
        ${description}
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${title}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F3F4F6;
">

  <!-- PREHEADER -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
  ">
    ${escapeHtml(previewText)}
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#F3F4F6;"
  >
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table
          width="640"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:640px;
            background:#FFFFFF;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #E5E7EB;
          "
        >

          <!-- HEADER -->
          <tr>
            <td style="
              padding:22px 28px;
              background:#FFFFFF;
              border-bottom:1px solid #E5E7EB;
            ">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td valign="middle">

                    <div style="
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:20px;
                      line-height:26px;
                      font-weight:800;
                      letter-spacing:-.3px;
                      color:#111827;
                    ">
                      INFINIA
                      <span style="color:#C8102E;">
                        BHARAT NEWS
                      </span>
                    </div>

                    <div style="
                      margin-top:3px;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:12px;
                      line-height:18px;
                      color:#6B7280;
                    ">
                      सच सबसे पहले
                    </div>

                  </td>

                  <td
                    width="8"
                    style="
                      width:8px;
                      background:#C8102E;
                      border-radius:4px;
                    "
                  >
                    &nbsp;
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- MAIN -->
          <tr>
            <td style="padding:30px 28px 34px 28px;">

              <!-- BADGE -->
              <div style="
                display:inline-block;
                padding:6px 10px;
                background:#FEF2F2;
                border-radius:6px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:10px;
                line-height:14px;
                font-weight:800;
                letter-spacing:.08em;
                color:#C8102E;
              ">
                ${badge}
              </div>

              <!-- HEADING -->
              <div style="
                margin-top:14px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:26px;
                line-height:34px;
                font-weight:750;
                letter-spacing:-.5px;
                color:#111827;
              ">
                ${escapeHtml(heading)}
              </div>

              <!-- ARTICLE -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:28px;"
              >

                ${imageBlock}

                <tr>
                  <td>

                    <div style="
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:10px;
                      line-height:15px;
                      font-weight:800;
                      letter-spacing:.1em;
                      color:#C8102E;
                    ">
                      ARTICLE
                    </div>

                    <div style="
                      margin-top:6px;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:19px;
                      line-height:27px;
                      font-weight:700;
                      color:#111827;
                    ">
                      ${title}
                    </div>

                    ${descriptionBlock}

                  </td>
                </tr>

              </table>


              <!-- DIVIDER -->
              <div style="
                height:1px;
                background:#E5E7EB;
                margin:26px 0;
              "></div>


              <!-- ORIGINAL COMMENT -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                ${originalBlock}

                <!-- NEW MESSAGE -->
                <tr>
                  <td>

                    <div style="
                      border:1px solid #E5E7EB;
                      background:#FFFFFF;
                      border-radius:12px;
                      padding:18px;
                    ">

                      <div style="
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:11px;
                        line-height:16px;
                        font-weight:700;
                        letter-spacing:.08em;
                        color:#C8102E;
                        text-transform:uppercase;
                        margin-bottom:9px;
                      ">
                        ${messageLabel}
                      </div>

                      <div style="
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:15px;
                        line-height:24px;
                        color:#1F2937;
                        word-break:break-word;
                      ">
                        ${message}
                      </div>

                    </div>

                  </td>
                </tr>

              </table>


              <!-- BUTTON -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:28px;"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#C8102E"
                    style="border-radius:9px;"
                  >
                    <a
                      href="${safeArticleUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:13px 21px;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:14px;
                        line-height:20px;
                        font-weight:700;
                        color:#FFFFFF;
                        text-decoration:none;
                        border-radius:9px;
                      "
                    >
                      View Article &amp; Reply
                    </a>
                  </td>
                </tr>
              </table>


              <!-- NOTE -->
              <div style="
                margin-top:20px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:19px;
                color:#9CA3AF;
              ">
                Click the button above to open the article and continue
                the conversation.
              </div>

            </td>
          </tr>


          <!-- FOOTER -->
          <tr>
            <td style="
              padding:20px 28px;
              background:#F9FAFB;
              border-top:1px solid #E5E7EB;
            ">

              <div style="
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:19px;
                color:#6B7280;
              ">
                This is an automatic notification from
                <strong style="color:#374151;">
                  INFINIA BHARAT NEWS
                </strong>.
              </div>

              <div style="
                margin-top:5px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:18px;
                color:#9CA3AF;
              ">
                सच सबसे पहले
              </div>

            </td>
          </tr>

        </table>

        <!-- OUTSIDE FOOTER -->
        <div style="
          max-width:640px;
          margin-top:14px;
          font-family:Arial,Helvetica,sans-serif;
          font-size:10px;
          line-height:16px;
          color:#9CA3AF;
          text-align:center;
        ">
          INFINIA BHARAT NEWS
        </div>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  return {
    subject,
    html,
  };
}