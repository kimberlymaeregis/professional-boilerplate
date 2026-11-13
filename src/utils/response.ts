import { Response } from 'express';

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export const sendSuccess = (
    res: Response,
    data: any,
    message?: string,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        ...(message && { message }),
        data,
    });
};

export const sendCreated = (
    res: Response,
    data: any,
    message = 'Resource created successfully'
) => {
    return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
    return res.status(204).send();
};

export const sendPaginated = (
    res: Response,
    data: any[],
    meta: PaginationMeta
) => {
    return res.status(200).json({
        success: true,
        data,
        meta,
    });
};

export const createPaginationMeta = (
    total: number,
    page: number,
    limit: number
): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
