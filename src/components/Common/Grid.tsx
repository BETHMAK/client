import { Grid, GridProps } from '@mui/material';
import React from 'react';

type GridContainerProps = GridProps & {
    children: React.ReactNode;
};

type GridItemProps = GridProps & {
    children: React.ReactNode;
};

export const GridContainer: React.FC<GridContainerProps> = ({ children, ...props }) => (
    <Grid container {...props}>
        {children}
    </Grid>
);

export const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => (
    <Grid item {...props}>
        {children}
    </Grid>
);

