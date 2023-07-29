import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params }) => {
    // const slug = Number(params.slug);
    return {
        slug: params.slug,
    }
}

export const ssr = false