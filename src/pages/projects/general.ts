export const getDirection = (direction: string) => {
    switch(direction.toLowerCase()){
        case 'north':
            return 'شمال';
        case 'south':
            return 'جنوب';
        case 'east':
            return 'شرق';
        case 'west':
            return 'غرب';
        case 'north-east':
            return 'شمال-شرق';
        case 'north-west':
            return 'شمال-غرب';
        case 'south-east':
            return 'جنوب-شرق';
        case 'south-west':
            return 'جنوب-غرب';
        default:
            return direction;
    }
}