import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/config";
import { DocumentStackIcon } from "@/lib/og/icons";
import { renderOgImage } from "@/lib/og/template";
import { getOgSeo } from "@/lib/seo";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    ...getOgSeo("bank"),
    eyebrow: "Bank",
    accentIcon: DocumentStackIcon,
  });
}
