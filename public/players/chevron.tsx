export default function Chevron({ fill = '#94A3B8', width = '', classes = '' }) {
    return (
        <svg className={`transition-all duration-200 ${classes}`} width={width} height={width} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L16 20L24 12" stroke={fill} strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}