import Button from '@/components/common/Button';
import Table, { tableDataT } from '@/components/common/table/Table';
import Footer from '@/components/globals/footer/Footer';
import Navbar from '@/components/globals/navbar/Navbar';
import RecentMetrics from '@/components/globals/recent_metrics/RecentMetrics';
import React, { useState, useEffect } from 'react';
import BundlesTable from './bundles_table.json';
import BundlersTable from './bundlers_table.json';
import PaymastersTable from './paymasters_table.json';
import OperationsTable from './operations_table.json';
import Searchblock from '../../components/globals/searchblock/Searchblock';
import { NETWORK_ICON_MAP } from '@/components/common/constants';
import { getLatestBundles, getLatestUserOps, getTopBundlers, getTopPaymasters } from '@/components/common/apiCalls/jiffyApis';
import { getFee, getTimePassed } from '@/components/common/utils';
import { useConfig } from '../../context/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
    const { selectedNetwork, setSelectedNetwork } = useConfig();
    const [bundlesTable, setBundlesTable] = useState<tableDataT>(BundlesTable as tableDataT);
    const [operationsTable, setOperationsTable] = useState<tableDataT>(OperationsTable as tableDataT);
    const [bundlersTable, setBundlersTable] = useState<tableDataT>(BundlersTable as tableDataT);
    const [paymastersTable, setPaymastersTable] = useState<tableDataT>(PaymastersTable as tableDataT);
    const [userOpTableLoading, setUserOpTableLoading] = useState(true);
    const [bundleTableLoading, setBundleTableLoading] = useState(true);
    const [bundlerTableLoading, setBundlerTableLoading] = useState(true);
    const [paymasterTableLoading, setPaymasterTableLoading] = useState(true);
    useEffect(() => {
        refreshBundlesTable(selectedNetwork);
        refreshUserOpsTable(selectedNetwork);
        refreshBundlersTable(selectedNetwork);
        refreshPaymastersTable(selectedNetwork);
    }, [selectedNetwork]);

    const refreshBundlesTable = async (network: string) => {
        setBundleTableLoading(true);
        const bundles = await getLatestBundles(network, 5, 0, toast);
        let newRows = [] as tableDataT['rows'];
        bundles.forEach((bundle) => {
            newRows.push({
                token: {
                    text: bundle.transactionHash,
                    icon: NETWORK_ICON_MAP[network],
                    type: 'bundle',
                },
                ago: getTimePassed(bundle.blockTime),
                userOps: bundle.userOpsLength + ' ops',
                status: true,
            });
        });
        setBundlesTable({ ...bundlesTable, rows: newRows.slice(0, 5) });
        setBundleTableLoading(false);
    };

    const refreshPaymastersTable = async (network: string) => {
        const paymasters = await getTopPaymasters(network, 5, 0, toast);
        let newRows: tableDataT['rows'] = [];
        paymasters.forEach((paymaster) => {
            newRows.push({
                token: {
                    text: paymaster.address,
                    icon: NETWORK_ICON_MAP[network],
                    type: 'paymaster',
                },
                userOps: `${paymaster.userOpsLength} ops`,
            });
        });
        setPaymastersTable({ ...paymastersTable, rows: newRows.slice(0, 10) });
        setPaymasterTableLoading(false);
    };

    const refreshBundlersTable = async (network: string) => {
        const bundlers = await getTopBundlers(network, 5, 0, toast);
        let newRows: tableDataT['rows'] = [];
        bundlers.forEach((bundler) => {
            newRows.push({
                token: {
                    text: bundler.address,
                    icon: NETWORK_ICON_MAP[network],
                    type: 'bundler',
                },
                userOps: `${bundler.bundleLength} bundles`,
                fee: getFee(parseInt(bundler.actualGasCostSum), network),
            });
        });
        console.log(newRows);
        setBundlersTable({ ...bundlersTable, rows: newRows });
        setBundlerTableLoading(false);
    }

    const refreshUserOpsTable = async (network: string) => {
        setUserOpTableLoading(true);
        const userOps = await getLatestUserOps(network, 5, 0, toast);
        let newRows = [] as tableDataT['rows'];
        userOps.forEach((userOp) => {
            newRows.push({
                token: {
                    text: userOp.userOpHash,
                    icon: NETWORK_ICON_MAP[network],
                    type: 'userOp',
                },
                ago: getTimePassed(userOp.blockTime!),
                sender: userOp.sender,
                target: userOp.target!,
                status: userOp.success!,
            });
        });
        setOperationsTable({ ...operationsTable, rows: newRows.slice(0, 5) });
        setUserOpTableLoading(false);
    };

    return (
        <div>
            <Navbar />
            <section className="py-6">
                <div className="container">
                    <h1 className="font-bold text-xl leading-8 md:text-3xl mb-2 md:mb-4">
                        UserOp Explorer for{' '}
                        <a href="https://eips.ethereum.org/EIPS/eip-4337" target="_blank" style={{ textDecoration: 'underline' }}>
                            4337
                        </a>
                    </h1>
                    <div>
                        <Searchblock isNavbar={false} />
                    </div>
                </div>
            </section>
            <RecentMetrics selectedNetwork={selectedNetwork} handleNetworkChange={setSelectedNetwork} />
            <section className="mb-12">
                <div className="container grid-cols-1 md:grid-cols-2 grid gap-10">
                    <div>
                        <Table
                            {...(bundlesTable as tableDataT)}
                            loading={bundleTableLoading}
                            caption={{
                                children: 'Recent Bundles',
                                icon: '/images/swap-vertical-bold (1).svg',
                                text: 'Recent bundles Processed by selected chain',
                            }}
                        />

                        <div className="mt-4">
                            <Button href="/recentBundles">View all bundles</Button>
                        </div>
                    </div>
                    <div>
                        <Table
                            {...(operationsTable as tableDataT)}
                            loading={userOpTableLoading}
                            caption={{
                                children: 'Recent User Operations',
                                icon: '/images/swap-vertical-bold (1).svg',
                                text: 'Recent User Operations Processed by selected chain',
                            }}
                        />
                        <div className="mt-4">
                            <Button href="/recentUserOps">View all User operations</Button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="mb-12">
                <div className="container grid-cols-1 md:grid-cols-2 grid gap-10">
                    <div>
                        <Table
                            {...(bundlersTable as tableDataT)}
                            loading={bundlerTableLoading}
                            caption={{
                                children: 'Top Bundlers',
                                icon: '/images/swap-vertical-bold (1).svg',
                                text: 'Top Bundlers by selected chain',
                            }}
                        />

                        <div className="mt-4">
                            <Button href="/bundlers">View all Bundlers</Button>
                        </div>
                    </div>
                    <div>
                        <Table
                            {...(paymastersTable as tableDataT)}
                            loading={paymasterTableLoading}
                            caption={{
                                children: 'Top Paymasters',
                                icon: '/images/swap-vertical-bold (1).svg',
                                text: 'Top Paymaster by selected chain',
                            }}
                        />
                        <div className="mt-4">
                            <Button href="/paymasters">View all Paymasters</Button>
                        </div>
                    </div>
                </div>
            </section>
            <ToastContainer />
            <Footer />
        </div>
    );
}

export default Home;
