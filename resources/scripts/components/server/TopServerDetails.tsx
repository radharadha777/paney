import React, { useEffect, useState, useMemo } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import PowerButtons from '@/components/server/console/PowerButtons';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { GlobeIcon, ChipIcon, HashtagIcon, SaveIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory } from '@fortawesome/free-solid-svg-icons';
import Can from '@/components/elements/Can';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Card from '@/components/ui/Card';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Title from '@/components/ui/Title';
import { StatBlock } from '@/components/ui/StatBlock';
import { useStoreState } from 'easy-peasy';
import Blur from '@/components/ui/Blur';

type Stats = Record<'memory' | 'cpu' | 'disk', number>;

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'text-xs text-gray-300'}>/ {limit || <>&infin;</>}</span>
    </>
);

const Container = styled.div`
    ${tw`relative z-10 pt-4`};
`;

const UtilContainer = styled.div`
    ${tw`mx-auto w-full md:flex items-center justify-between max-w-[75rem]`};
`;

const StatContainer = styled.div`
    ${tw`lg:flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 `};
`;
const TopServerDetails = () => {
    const [stats, setStats] = useState<Stats>({
        memory: 0,
        cpu: 0,
        disk: 0,
    });

    const [showStats, setShowStats] = useState(false);
    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
        });
    });

    return (
        <Container>
            <Card className={`!p-4 !px-8`}>
                <UtilContainer>
                    <div className={'flex items-center gap-x-3'}>
                        <Title className='text-3xl'>{name}</Title>
                        {rootAdmin && (
                            // eslint-disable-next-line react/jsx-no-target-blank
                            <a href={`/admin/servers/view/${serverId}`} target={'_blank'} className='h-5 w-5'>
                                <ExternalLinkIcon />
                            </a>
                        )}
                    </div>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className='md:grid grid-cols-3 gap-2 hidden' />
                        <PowerButtons className='md:hidden grid-cols-3 gap-2 grid mt-5 pt-5' />
                    </Can>
                </UtilContainer>
            </Card>
            <div className='w-full sm:hidden flex justify-center mb-2 mt-2'>
                <button
                    className='w-full py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-ui'
                    onClick={() => setShowStats((prev) => !prev)}
                >
                    {showStats ? 'Hide Stats ' : 'Show Stats'}
                </button>
            </div>
            <StatContainer className={`${showStats ? '' : 'hidden'} flex`}>
                <StatBlock className='backdrop-blur-sm bg-gray-500/20 border border-gray-500/50'>
                    <span className='w-5 text-gray-300'>
                        <GlobeIcon />
                    </span>
                    <CopyOnClick text={allocation}>
                        <Blur className={`text-sm text-gray-100`}>{allocation}</Blur>
                    </CopyOnClick>
                </StatBlock>

                <StatBlock className='backdrop-blur-sm bg-gray-500/20 border border-gray-500/50'>
                    <span className='w-5 text-gray-300'>
                        <ChipIcon />
                    </span>
                    <span className='text-sm text-gray-100'>
                        {status === 'offline' ? (
                            <Limit limit={textLimits.cpu}>0%</Limit>
                        ) : (
                            <Limit limit={textLimits.cpu}>{stats.cpu.toFixed(2)}%</Limit>
                        )}
                    </span>
                </StatBlock>

                <StatBlock className='backdrop-blur-sm bg-gray-500/20 border border-gray-500/50'>
                    <span className='w-5 text-gray-300'>
                        <FontAwesomeIcon icon={faMemory} />
                    </span>
                    <span className='text-sm text-gray-100'>
                        {status === 'offline' ? (
                            <Limit limit={textLimits.memory}>0 MiB</Limit>
                        ) : (
                            <Limit limit={textLimits.memory}>{bytesToString(stats.memory)}</Limit>
                        )}
                    </span>
                </StatBlock>

                <StatBlock className='backdrop-blur-sm bg-gray-500/20 border border-gray-500/50'>
                    <span className='w-5 text-gray-300'>
                        <SaveIcon />
                    </span>
                    <span className='text-sm text-gray-100'>
                        <Limit limit={textLimits.disk}>{bytesToString(stats.disk)}</Limit>
                    </span>
                </StatBlock>

                <StatBlock className='backdrop-blur-sm bg-gray-500/20 border border-gray-500/50'>
                    <span className='w-5 text-gray-300'>
                        <HashtagIcon />
                    </span>
                    <CopyOnClick text={id}>
                        <span className='text-sm text-gray-100'>{id}</span>
                    </CopyOnClick>
                </StatBlock>
            </StatContainer>
        </Container>
    );
};
export default TopServerDetails;
