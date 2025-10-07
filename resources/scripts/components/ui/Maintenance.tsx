import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import Card from '@/components/ui/Card';
import Title from '@/components/ui/Title';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { LogoContainer } from '@/components/ui/LogoContainer';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { LogoutIcon } from '@heroicons/react/solid';

const Container = styled.div`
    ${tw`my-auto mx-auto`}
`;

const CardContainer = styled.div`
    ${tw`max-w-[28.125rem] w-screen pt-10`}
`;

export default () => {
    const logo = useStoreState((state: ApplicationStore) => state.reviactyl.data!.logo);
    const maintenance = useStoreState((state) => state.reviactyl.data!.maintenance);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };
    return (
        <PageContentBlock className='flex flex-col h-full' title={'Under Maintenance'} showFlashKey={'dashboard'}>
            <Container>
                <CardContainer>
                    <LogoContainer>
                        <img src={logo} alt='reviactyl' css={tw`h-[3rem]`} />
                    </LogoContainer>
                    <Card>
                        <SpinnerOverlay visible={isLoggingOut} />
                        <Title className='text-3xl text-center pb-3'>Under Maintenance</Title>
                        <p className='text-center'>{maintenance}</p>
                    </Card>
                    <button className='flex items-center mx-auto mt-2' onClick={onTriggerLogout}>
                        <span className='text-danger/80'>Logout</span> <LogoutIcon className='w-5 h-5 text-danger/80' />
                    </button>
                </CardContainer>
            </Container>
        </PageContentBlock>
    );
};
