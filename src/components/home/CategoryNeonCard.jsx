import React from 'react';
import CategoryCard from './CategoryCard';
import { usePlatformNeon } from '../../theme/usePlatformNeon';

const CategoryNeonCard = (props) => {
  const neon = usePlatformNeon('categories', props.category?.id);
  return <div className={`platform-category-neon-card ${neon.className}`} style={neon.style}>
    <CategoryCard {...props} />
  </div>;
};

export default CategoryNeonCard;
