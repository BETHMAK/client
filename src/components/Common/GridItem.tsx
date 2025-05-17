import { Grid, GridProps } from '@mui/material';
import React from 'react';

interface GridItemProps extends GridProps {
    children: React.ReactNode;
}

const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => (
    <Grid {...props}>
        {children}
    </Grid>
);

export default GridItem;
