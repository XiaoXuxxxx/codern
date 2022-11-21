import { SwitchThemeButton } from '@/features/common/SwitchThemeButton';
import { Text } from '@/features/common/Text';
import { Popover, Transition } from '@headlessui/react'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { route } from 'preact-router';
import MockupAvatar from '@/assets/mockup-avatar.svg';
import { ProfileDropdownButton } from '@/features/common/navbar/ProfileDropdownButton';
import { fetch } from '@/utils/Fetch';

export const ProfileDropdown = () => {
  const logout = () => {
    fetch
      .get('/auth/logout')
      .finally(() => route('/'));
  };

  return (
    <Popover className="relative flex z-[9999]">
      {({ open }: { open: boolean }) => (
        <>
          <Popover.Button className="focus:outline-none">
            <img src={MockupAvatar} alt="" className="w-8 h-8 rounded-md hover:border-2 border-black dark:border-neutral-300" />
          </Popover.Button>

          <Transition
            show={open}
            enter="transition duration-200 ease-in"
            enterFrom="transform scale-80 opacity-0 -translate-y-2"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-200 ease-in"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-80 opacity-0 -translate-y-2"
          >
            <Popover.Panel className="absolute top-0 right-0 border border-neutral-300 dark:border-neutral-700 transform translate-y-10 rounded-md shadow-lg transition-theme">
              <div className="bg-white dark:bg-black flex flex-col p-2 rounded-md transition-theme">
                <span className="flex flex-row justify-between items-center space-x-2 px-4 py-2">
                  <Text color="secondary" className="text-sm">Theme</Text>
                  <SwitchThemeButton direction="down" />
                </span>

                <ProfileDropdownButton
                  icon={<ArrowLeftOnRectangleIcon />}
                  text="Logout"
                  onClick={logout}
                />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
