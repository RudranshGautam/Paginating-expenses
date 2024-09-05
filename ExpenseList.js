import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchExpenses();
    }, [currentPage]);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(`/expenses/data?page=${currentPage}&limit=10`);
            setExpenses(response.data.expenses);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <h2>Expense Tracker</h2>
            <ul>
                {expenses.map(expense => (
                    <li key={expense.id}>
                        {expense.amount} - {expense.description} - {expense.category}
                    </li>
                ))}
            </ul>

            <div id="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={page === currentPage}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
