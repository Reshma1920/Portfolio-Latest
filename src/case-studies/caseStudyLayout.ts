/** Shared shell width for Okto + HDFC case studies. */
export const CASE_STUDY_MAX_WIDTH_CLASS = 'max-w-[1200px]'

/** +80px horizontal inset vs prior `sm:px-6` at sm+; modest bump on narrow viewports. */
export const CASE_STUDY_HORIZONTAL_PADDING_CLASS = 'px-6 sm:px-[104px]'

export const caseStudyContainerClass = `mx-auto w-full ${CASE_STUDY_MAX_WIDTH_CLASS} ${CASE_STUDY_HORIZONTAL_PADDING_CLASS}`

export const caseStudyMainClass = `${caseStudyContainerClass} pb-28`
