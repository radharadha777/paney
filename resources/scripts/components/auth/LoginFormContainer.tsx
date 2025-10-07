import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import Card from '@/components/ui/Card';
import Title from '@/components/ui/Title';
import { LogoContainer } from '@/components/ui/LogoContainer';
import tw from 'twin.macro';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import Footer from '@/components/ui/Footer';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`my-auto mx-auto`}
`;

const CardContainer = styled.div`
    ${tw`max-w-[28.125rem] w-screen p-5`}
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const logo = useStoreState((state: ApplicationStore) => state.reviactyl.data!.logo);
    return (
        <Container>
            <FlashMessageRender css={tw`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <CardContainer>
                    <LogoContainer>
                        <img src={logo} alt='reviactyl' css={tw`h-[3rem]`} />
                    </LogoContainer>
                    <Card>
                        {title && <Title className='text-3xl text-center pb-3'>{title}</Title>}
                        {props.children}
                    </Card>
                </CardContainer>
            </Form>
            <Footer />
        </Container>
    );
});
