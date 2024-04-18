import { body } from "express-validator";

export const addTaskValidation = [
    body("name", "Task name is required").not().isEmpty(),
    body("workload")
        .optional()
        .if(body("workload").exists())
        .isNumeric().withMessage('Workload must be a number')
        .isFloat({ min: 1, max: 5 }).withMessage('Workload must be between 1 and 5')
];
export const addTagValidation = [
    body("name", "Tag name is required").not().isEmpty(),
];

