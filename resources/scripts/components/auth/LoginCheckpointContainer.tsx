import React, { useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { ActionCreator } from 'easy-peasy';
import { StaticContext } from 'react-router';
import { useFormikContext, withFormik } from 'formik';
import useFlash from '@/plugins/useFlash';
import { FlashStore } from '@/state/flashes';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { useTranslation } from 'react-i18next';

interface Values {
    code: string;
    recoveryCode: '';
}

type OwnProps = RouteComponentProps<Record<string, string | undefined>, StaticContext, { token?: string }>;

type Props = OwnProps & {
    clearAndAddHttpError: ActionCreator<FlashStore['clearAndAddHttpError']['payload']>;
};

const LoginCheckpointContainer = () => {
    const { t } = useTranslation('auth');
    const { isSubmitting, setFieldValue } = useFormikContext<Values>();
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    return (
        <LoginFormContainer title={t('checkpoint.title')} css={tw`w-full flex`}>
            <div css={tw`mt-3`}>
                <Field
                    icon={DotsHorizontalIcon}
                    name={isMissingDevice ? 'recoveryCode' : 'code'}
                    title={isMissingDevice ? t('checkpoint.recovery-code') : t('checkpoint.auth-code')}
                    description={isMissingDevice ? t('checkpoint.is-missing') : t('checkpoint.is-not-missing')}
                    type={'text'}
                    autoComplete={'one-time-code'}
                    autoFocus
                />
            </div>
            <div css={tw`mt-3`}>
                <Button css={tw`w-full !py-3`} type={'submit'} disabled={isSubmitting}>
                    {t('checkpoint.button')}
                </Button>
            </div>
            <div css={tw`mt-3 text-center`}>
                <span
                    onClick={() => {
                        setFieldValue('code', '');
                        setFieldValue('recoveryCode', '');
                        setIsMissingDevice((s) => !s);
                    }}
                    css={tw`cursor-pointer text-sm text-reviactyl/80 tracking-wide no-underline hover:text-reviactyl/50`}
                >
                    {!isMissingDevice ? t('checkpoint.lost-device') : t('checkpoint.not-lost-device')}
                </span>
            </div>
            <div css={tw`mt-3 text-center`}>
                <Link
                    to={'/auth/login'}
                    css={tw`text-sm text-reviactyl/80 tracking-wide no-underline hover:text-reviactyl/50`}
                >
                    {t('return')}
                </Link>
            </div>
        </LoginFormContainer>
    );
};

const EnhancedForm = withFormik<Props, Values>({
    handleSubmit: ({ code, recoveryCode }, { setSubmitting, props: { clearAndAddHttpError, location } }) => {
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                setSubmitting(false);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    },

    mapPropsToValues: () => ({
        code: '',
        recoveryCode: '',
    }),
})(LoginCheckpointContainer);

export default ({ history, location, ...props }: OwnProps) => {
    const { clearAndAddHttpError } = useFlash();

    if (!location.state?.token) {
        history.replace('/auth/login');

        return null;
    }

    return (
        <EnhancedForm clearAndAddHttpError={clearAndAddHttpError} history={history} location={location} {...props} />
    );
};
