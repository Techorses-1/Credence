import React from 'react';
import AppealsFooter from '../AppealsFooter/AppealsFooter';
import AppealsNavbar from '../AppealsNavbar/AppealsNavbar';

const AppealsLayout = ({ children }) => {
    return (
        <>
            <AppealsNavbar /> {/* Navbar will be fixed position */}
            <main style={{ paddingTop: '108px' }}> {/* Adjust this value based on your navbar height */}
                {children}
            </main>
            <AppealsFooter />
        </>
    );
};

export default AppealsLayout;