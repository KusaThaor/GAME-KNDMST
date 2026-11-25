import { useState } from 'preact/hooks';
import type { Gender } from '../../../content/types';
import { PLAYER_NAME_MAX } from '../../../core/save';
import { Pop } from '../overlays/NoticeModal';
import type { UiActions } from '../store';

export function ProfileCard({ a }: { a: UiActions }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const ok = name.trim().length > 0;
  return (
    <Pop class="g-card g-profile" testid="profile">
      <h2>Bạn tên là gì?</h2>
      <input data-act="name" value={name} maxLength={PLAYER_NAME_MAX} placeholder={`Tối đa ${PLAYER_NAME_MAX} ký tự`} autoFocus
        onInput={(e) => setName((e.target as HTMLInputElement).value)} />
      <p class="g-hint">Tên chỉ lưu trên máy của bạn.</p>
      <div class="g-row">
        <button class={gender === 'male' ? 'on' : ''} data-act="gender-male" onClick={() => setGender('male')}>Nam</button>
        <button class={gender === 'female' ? 'on' : ''} data-act="gender-female" onClick={() => setGender('female')}>Nữ</button>
      </div>
      <button class="primary" data-act="profile-ok" disabled={!ok} onClick={() => a.submitProfile(name, gender)}>Bắt đầu</button>
    </Pop>
  );
}
