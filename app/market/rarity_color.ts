export default function rarity_color(rarity: string) {
    switch(rarity) {
        case 'unique':
            return '#d63031'
        case 'legendary':
            return '#F1C40E'
        case 'rare':
            return '#3471A3'
        case 'common':
            return '#27A15C'
        default:
            return '#fff'
    }
}